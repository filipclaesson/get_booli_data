var pg = require('pg');

// -- postgres pass
// var pass;
// fs = require('fs')
// // fs.readFile('/home/pi/node_apps/postgres_pass.txt', 'utf8', function (err,data) {
//     fs.readFile('/Users/Filip/postgres_pass.txt', 'utf8', function (err,data) {
//   if (err) {
//     return console.log(err);
//   }
//   pass = data;
// });
// -- -- -- -- -- -- 


promise = require('promise');
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
//raspi

// local
// var cn = {
//     host: 'localhost',
//     port: 5432,
//     database: 'postgres',
//     user: 'postgres',
//     password: "lagge"
// };


function getDB(){
    var pass;
    fs = require('fs')
    // fs.readFile('/home/pi/node_apps/postgres_pass.txt', 'utf8', function (err,data) {
        fs.readFile('/Users/Filip/postgres_pass.txt', 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      pass = data;
    });
    var cn = {
        host: 'localhost',
        port: 5432,
        database: 'postgres',
        user: 'filip',
        password: pass
    };
    return pgp(cn);
}

function runQuery(query,db, callback) {
    console.log('inne i qunQuery')
	//var db = pgp(cn);
	db.any(query, [true])
    .then(function (data) {
        response = {
            db_success: true,
            data: data
        }
        console.log("detta skickas till servern")
        console.log("length: " + response.data.length)
        callback(response)
    })
    .catch(function (error) {
        response = {
            db_success: false,
            data: error
        }
        console.log(error)

        callback(response)
        // error;
    });
}

function insertMultiSLgeo(dataIn, db, callback) {
    dataQueries = []; 
    //var db = pgp(cn);
    db.tx(function(t) {
        for (i in dataIn){
            query = getInsertQueryForSLGeo(dataIn[i])
            dataQueries.push(t.none(query[0], query[1]))
        }
        // this.ctx = transaction config + state context;
        return t.batch(dataQueries);
    })
    .then(function (data) {
        console.log("---------------------------------------")
        console.log("-- Db finished with Success ..." );
        console.log("---------------------------------------")
        // success;
    })
    .catch(function (error) {
        console.log("ERROR:", error.message || error);
    });
}

function insertMultiApartments(dataIn, db,callback) {
    dataQueries = []; 
    //var db = pgp(cn);
    db.tx(function(t) {
        for (i in dataIn){
            query = getInsertQueryForApartments(dataIn[i])
            dataQueries.push(t.none(query[0], query[1]))
        }
        // this.ctx = transaction config + state context;
        return t.batch(dataQueries);
    })
    .then(function (data) {
        console.log("---------------------------------------")
        console.log("-- Step 6: Db finished with Success ..." );
        console.log("---------------------------------------")
        // success;
    })
    .catch(function (error) {
        console.log("ERROR:", error.message || error);
    });
}

function getInsertQueryForApartments(aptObject){
    // queryString = "insert into apartments(booli_id, address, distance_to_ocean, areas, lon, lat, room, floor, sqm, listprice, price_up, sold_price, rent, construction_year, object_type, broker, broker_id, broker_type, avg_time_to_central, min_time_to_central, max_time_to_central, avg_commuting_walk_distance, min_commuting_walk_distance, max_commuting_walk_distance, avg_commuting_departures_per_hour) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)";
    queryString = "insert into apartments(booli_id,sold_date,address,areas,lon,lat,room,floor,sqm,listprice,price_up,sold_price,rent,distance_to_ocean,construction_year,object_type,broker,broker_id,broker_type) select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19 where not exists (select 1 from apartments a where a.booli_id = $1::text)";
    data = [
    aptObject.booliId,
    aptObject.soldDate,
    aptObject.address,
    aptObject.areas,
    aptObject.lon,
    aptObject.lat,
    aptObject.room,
    aptObject.floor,
    aptObject.sqm,
    aptObject.listPrice,
    aptObject.priceUp,
    aptObject.soldPrice,
    aptObject.rent,
    aptObject.distanceToOcean,
    aptObject.constructionYear,
    aptObject.objectType,
    aptObject.broker,
    aptObject.brokerId,
    aptObject.brokerType
    ]
    return [queryString, data];
}

function getInsertQueryForSLGeo(slObject){
    queryString = "insert into geo_data_sl(lon, lat, avg_time_to_central, min_time_to_central, max_time_to_central, avg_commuting_walk_distance, min_commuting_walk_distance, max_commuting_walk_distance, avg_commuting_departures_per_hour) values($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    //queryString = "insert into apartments(booli_id,sold_date,address,areas,lon,lat,room,floor,sqm,listprice,price_up,sold_price,rent,distance_to_ocean,construction_year,object_type,broker,broker_id,broker_type) select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19 where not exists (select 1 from apartments a where a.booli_id = $1::text)";
    data = [
    slObject.lon,
    slObject.lat,
    slObject.distanceVariables[0].avg_time,
    slObject.distanceVariables[0].min_time,
    slObject.distanceVariables[0].max_time,
    slObject.distanceVariables[0].avg_walk_distance,
    slObject.distanceVariables[0].min_walk,
    slObject.distanceVariables[0].max_walk,
    slObject.distanceVariables[0].departures_per_hour
    ]
    return [queryString, data];
}

module.exports = {
  runQuery: runQuery,
  insertMultiSLgeo: insertMultiSLgeo,
  insertMultiApartments: insertMultiApartments,
  getDB:getDB
};
