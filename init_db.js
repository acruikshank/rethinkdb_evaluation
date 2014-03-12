var r = require('rethinkdb');
var _ = require('underscore');

function choose(list) { return list[ (Math.random() * list.length)|0 ]; }
function Chooser( objects ) {
  var choices=[], weights=[0], totalWeight=0, chooser={};
  var add = chooser.add = function( obj, weight ) {
    choices.push(obj);
    weights.push( totalWeight += weight );
    return chooser;
  }
  chooser.choose = function() {
    if ( choices.length == 0 ) return null;
    var choice = Math.random() * totalWeight, start=0, end=weights.length-1, next;
    while ( end > start + 1 ) {
      next=start+Math.floor((end - start)/2);
      choice >= weights[next] ? start = next : end = next;
    }
    return choices[start];
  }
  if ( objects ) for (var key in objects) add( key, objects[key] );
  return chooser;
}

function bind(ctx, ops, next) {
  if (ops.length < 1) return next(null, ctx);
  ops[0](ctx, function(err, ctx) { 
    if (err) next(err);
    bind(ctx, ops.slice(1), next);
  });
}

function noop(ctx, next) {
  return function(err) { next(err,ctx) }
}

function digits(n) { return ((Math.random()*Math.pow(10,n))|0).toString() }

var surnames = "Smith,Brown,Lee,Wilson,Martin,Patel,Taylor,Wong,Campbell,Williams,Thompson,Jones".split(',');
var firstNames = "Frank,Robert,Edward,Henry,Harry,Thomas,Walter,Arthur,Fred,Albert,Clarence,Willie,Roy,Louis,Florence,Ethel,Emma,Marie,Clara,Bertha,Minnie,Bessie,Alice,Lillian,Edna,Grace,Annie,Mabel".split(',');
var brands = "Quaker oats porridge,Carrs water biscuits,Cadbury's cocoa,Tate & lyle sugar,Birds custard,Jacobs cream crackers,Bovril,golden shred marmalade,garabaldi biscuits,Patum Peperium,Fray Bentos,nestles condensed milk,typhoo tea,camp coffee,huntley and palmers,Shippams meat pastes,rowntrees pastilles,heinz beans,HP sauce".split(',');
var domains = "gmail.com,hotmail.com,example.com,carbonfive.com".split(',')
var streets = "Second,Third,First,Fourth,Park,Fifth,Main,Sixth,Oak,Seventh,Pine,Maple,Cedar,Eighth,Elm,View,Washington,Ninth,Lake,Hill".split(',')
var dates = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];
var skus = []; for (var i=0; i<15; i++) skus.push(digits(8));
var withoutWebVisits  = Chooser({ 0: 160, 1: 5, 2: 10, 3: 5, 4: 2, 5: 2, 6: 1 })
var withWebVisits     = Chooser({ 0: 70, 1: 7, 2: 10, 3: 13, 4: 5, 5: 4, 6: 3, 7: 2, 8: 1, 9: 1 })
var webVisits         = Chooser({ 0: 70, 1:10, 2:10, 3:5, 4:3, 5:2 })
var zipCodes          = Chooser({ '37421':50, '37415':25, '37412':10, '37411':5, '37406':4,
                                  '37405':3, '37416':2, '37404':1})

var NUM_CUSTOMERS = 200;
var END_DATE      = new Date(2014,3,11);
var DAYS          = 30;


bind( {}, [
  connect,
  listTables, 
  createCustomersTable, 
  createVisitsTable,
  createCustomers], 
  close);


function connect(ctx, next) {
  console.log('connecting');
  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    next(err, err || _({}).extend(ctx,{connection:conn}) );
  })
}

function listTables(ctx, next) {
  r.db('test').tableList().run(ctx.connection, function(err, result) {
    next(err, err || _({}).extend(ctx,{tables:_.object(result, result)}));
  })
}

function createCustomersTable(ctx, next) {
  if (ctx.tables.customers)
    return r.table('customers').delete().run(ctx.connection, noop(ctx,next) ); 

  console.log('creating customers table');
  r.tableCreate('customers').run(ctx.connection, noop(ctx,next) );
}

function createVisitsTable(ctx, next) {
  if (ctx.tables.visits)
    return r.table('visits').delete().run(ctx.connection, noop(ctx,next) );

  console.log('creating visits table');
  r.tableCreate('visits').run(ctx.connection, noop(ctx,next) );
}

function createCustomer(ctx, next) {
  var customer = {};
  customer.firstName = choose(firstNames);
  customer.lastName = choose(surnames);
  customer.email = customer.firstName.substr(0,1).toLowerCase() + customer.lastName.toLowerCase() + '@' + choose(domains);
  customer.address = {
    street: digits(3) + ' ' + choose(streets) + ' Street',
    state: 'TN',
    zip: zipCodes.choose()
  }
  customer.purchases = [];
  for (var d=0; d <= DAYS; d++ ) {
    var date = new Date(END_DATE.getTime() - (DAYS-d)*24*3600000)

    var purchaseCount = withWebVisits.choose();
    for (var i=0; i < purchaseCount; i++)
      customer.purchases.push({
        date: date,
        sku: choose(skus),
        name: choose(brands),
        amount: ((Math.random()*3000)|0) / 100
      })
  }

  r.table('customers').insert(customer).run(ctx.connection, function(err, result) {
    if (err) return next(err);
    createVisits(_({}).extend(ctx, {customerKey:result.generated_keys[0]} ), next);
  });
}

function createVisits(ctx, next) {
  var visits = [];
  for (var d=0; d <= DAYS; d++ ) {
    var date = new Date(END_DATE.getTime() - (DAYS-d)*24*3600000)
    var count = webVisits.choose()|0;
    if (count > 0)
      visits.push({ customer:ctx.customerKey, date: date, hits: count });
  }
  r.table('visits').insert(visits).run(ctx.connection, noop(ctx,next) );
}

function createCustomers(ctx, next) {
  console.log('adding', NUM_CUSTOMERS, 'customers');

  var ops = _.range(NUM_CUSTOMERS).map(function(n) { return createCustomer});
  bind(ctx, ops, next)
}

function close( err, ctx ) {
  console.log('closing connection');
  if (err) console.error(err);
  ctx.connection.close();
}