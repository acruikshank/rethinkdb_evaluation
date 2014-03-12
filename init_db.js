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

function bind(ctx, f1, f2, f3, etc) {
  if (!f2) return f1(ctx);
  var rest = [ctx].concat(Array.prototype.slice.call(arguments, 2));
  f1(ctx, function() { bind.apply(null, rest); });
}

var r = require('rethinkdb');
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    bind({connection:conn}, listTables, createTables, dropData, initializeDatabase, close);
})

function listTables(ctx, next) {
  r.db('test').tableList().run(ctx.connection, function(err, result) {
    if (err) throw err;
    ctx.hasTable = !!(~result.indexOf('customers'));
    next()
  })
}

function createTables(ctx, next) {
  if (ctx.hasTable)
    return next();

  r.db('test').tableCreate('customers').run(ctx.connection, function(err, result) {
    if (err) throw err;
    next();
  })  
}

function dropData(ctx, next) {
  r.db('test').table('customers').delete().run(ctx.connection, function(err, result) {
    if (err) throw err;
    next();
  })  
}

function initializeDatabase(ctx, next) {

  var customers = [];
  for (var c=0; c<NUM_CUSTOMERS; c++) {
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
    customer.webVisits = [];
    for (var d=0; d <= DAYS; d++ ) {
      var date = new Date(END_DATE.getTime() - (DAYS-d)*24*3600000)
      var visits = webVisits.choose()|0;
      if (visits > 0)
        customer.webVisits.push({ date: date, hits: visits, });

      var purchaseCount = (visits > 0 ? withWebVisits : withoutWebVisits).choose();
      for (var i=0; i < purchaseCount; i++)
        customer.purchases.push({
          date: date,
          sku: choose(skus),
          name: choose(brands),
          amount: ((Math.random()*3000)|0) / 100
        })
    }
    customers.push(customer);
  }
  r.table('customers').insert(customers).run(ctx.connection, function(err,result) {
    if (err) throw err;
    next();
  });
}

function close( ctx ) {
  ctx.connection.close();
}