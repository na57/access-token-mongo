/**
 * Created by 文琪 on 2015/3/1.
 */

var MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID;
var moment = require('moment');


/**
 * 初始化
 * @param db
 * 数据库连接字符串
 * @param collection
 * 保存access_token使用的Collection的名称，默认为'access_tokens'
 * @returns {{getToken: Function, saveToken: Function}}
 */
module.exports = function(db, collection){
    collection = collection || 'access_tokens';

    var getCollection = function (callback) {
        var col = db.collection(collection);                    // 获取集合实例
        callback(null, col);
    };

    return {
        // 获取指定的AccessToken
        /**
         * @param options
         * 指定参数。
         * appId
         * appSecret
         * expire 过期时间，默认为7000秒
         * @param callback
         */
        getToken: function (options, callback) {
            getCollection(function (err, col) {
                if(err) callback(err);
                else {
                    col.findOne({
                        'appId': options.appId,
                        'appSecret': options.appSecret,
                        'expire': {'$gt': new Date()}
                    }, function (err, at) {
                        if(err || at == null){
                            callback('error');
                        } else {
                            callback(err, at.token);
                        }
                    });
                }
            });
        },
        saveToken: function (options, token, callback) {
            options.expire = options.expire || 7000;

            getCollection(function (err, col) {
                if(err) callback(err);
                else {
                    col.update({
                        'appId': options.appId,
                        'appSecret': options.appSecret
                    }, {
                        'appId': options.appId,
                        'appSecret': options.appSecret,
                        'expire': moment().add(options.expire, 's').toDate(),
                        'token': token
                    }, {upsert: true}, function (err, doc) {
                        callback(err, doc);
                    });
                }
            });
        }
    };
}