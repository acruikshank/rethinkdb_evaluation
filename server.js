var r = require('rethinkdb');
var express = require("express");
var http = require("http");
var _ = require('underscore')

var app = express();
app.configure( function () {
  app.set( 'views', __dirname + '/views/' );
  app.set( 'view engine', 'jade' );
  app.use( '/js', express.static(__dirname + '/public/img') );
  app.use( express.static( __dirname + '/public' ) );
  app.use( express.bodyParser( { keepExtensions: true } ) );
} );

http.createServer(app).listen( 8739 );
console.log( "Listening on port 8739");

// ROUTES

app.get( '/', dbConnect, withAllCustomers, function( request, response ) {
  response.render('customer', {customers:request.customers});
});

app.get( '/products_by_zip', dbConnect, function( request, response ) {
  response.render('products_by_zip', {});
});

app.get( '/products_by_zip/product_counts', dbConnect, function( request, response, next ) {
  r.table("customers").hasFields('purchases').concatMap(function(customer) {
    return customer('purchases').map(function(purchase) {
      return {zip:customer('address')('zip'), product:purchase('name')};
    });
  }).groupBy('zip','product', r.count).run(request.connection, function(err, result) {
    if (err) return next(err);

    var byzip = result.reduce( function(acc, r) { 
      (acc[r.group.zip] = acc[r.group.zip] || {zip:r.group.zip})[r.group.product] = r.reduction; 
      return acc;
    }, {});
    response.send( _.values(byzip) );
  })
})

app.post( '/customer', dbConnect, function( request, response, next ) {
  request.body.customer.purchases = [];
  r.table('customers').insert(request.body.customer).run(request.connection, function(err, result) {
    if (err)
      return next(err);

    request.body.customer.id = result.generated_keys[0];
    response.send( request.body.customer );
  })
})

app.post( '/customer/:id/add-purchase', dbConnect, function( request, response, next ) {
  r.table('customers').get(request.params.id).update({
    purchases: r.row('purchases').append({
          date: new Date(),
          sku: 23023902,
          name: "Patum Peperium",
          amount: 14.58
        })
  }, {returnVals:true}).run(request.connection, function(err, result) {
    if (err) return next(err);
    response.send(result.new_val);
  })
})

app.post( '/customer/:id/delete', dbConnect, function( request, response, next ) {
  r.table('customers').get(request.params.id).delete().run(request.connection, function(err) {
    if (err) return next(err);
    response.send(204);    
  })
})

app.get( '/top_customers', dbConnect, function( request, response, next ) {
  r.table('customers').hasFields('purchases').map(function(customer) {
    return {
      id: customer('id'),
      firstName: customer('firstName'),
      lastName: customer('lastName'),
      purchaseTotal: customer('purchases').reduce(function(acc,purchase) {
          return acc.add(purchase('amount'));
        }, 0)
    }
  })
  .orderBy(r.desc('purchaseTotal')).limit(10)
  .innerJoin(
    r.table('visits').groupBy('customer', r.sum('hits')), 
    function( customer, visit ) {
      return customer('id').eq(visit('group')('customer'));
    }
  ).map({
    id:r.row('left')('id'), 
    firstName:r.row('left')('firstName'), 
    lastName:r.row('left')('lastName'), 
    purchases:r.row('left')('purchaseTotal'), 
    hits:r.row('right')('reduction')
  }).run(request.connection, function(err, result) {
    if (err) return next(err);
    response.render( 'top_customers', {customers:result} )
  })
})

// DATABASE MIDDLEWARE

function withAllCustomers( request, response, next ) {
  r.table('customers').run(request.connection, function(err,cursor) {
    if (err) 
      return next(err);

    cursor.toArray(function(err, customers) {
      if (err) 
        return next(err);

      request.customers = customers;
      next();
    })
  })
}

var connection;

function dbConnect(request, response, next) {
  if (connection) {
    request.connection = connection;
    return next();
  }

  bind({}, [connect, listTables, ensureCustomersTable, ensureVisitsTable, ensureVisitsIndices], function(err, ctx) {
    if (err) return next(err);
    connection = request.connection = ctx.connection;
    next();
  })
}

// DATABASE INFRASTRUCTURE

// run a sequence of async functions
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

function connect(ctx, next) {
  console.log('connecting');
  r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    connection = conn;
    next(err, err || _({}).extend(ctx,{connection:conn}) );
  })
}

function listTables(ctx, next) {
  r.db('test').tableList().run(ctx.connection, function(err, result) {
    next(err, err || _({}).extend(ctx,{tables:_.object(result, result)}));
  })
}

function ensureCustomersTable(ctx, next) {
  if (ctx.tables.customers)
    return next(null, ctx);

  console.log('creating customers table');
  r.tableCreate('customers').run(ctx.connection, noop(ctx,next) );
}

function ensureVisitsTable(ctx, next) {
  if (ctx.tables.visits)
    return next(null, ctx);

  console.log('creating visits table');
  r.tableCreate('visits').run(ctx.connection, noop(ctx,next) );
}

function ensureVisitsIndices(ctx, next) {
  r.table('visits').indexList().run(ctx.connection, function(err, result) {
    if (err)
      return next(err);

    if (result.indexOf('customer') > -1)
      return next(null, ctx);

    console.log('creating customer index on visits');
    r.table('visits').indexCreate('customer').run( ctx.connection, noop(ctx, next) );
  })
}



