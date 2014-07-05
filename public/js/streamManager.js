define(["md5baseJS", "dataManager"], function(md5, DataManager) {

    var peer,
        streamers = {},
        remoteCatalogue = {},
        queue = [],
        videoPieceQueue = [],
        actions = [
            {type : "getCatalogue", response : "sendCatalogue" },
            {type : "recieveCatalogue", response : "storeCatalogue"},
            {type : "sendStreamPiece", response : "requestStreamPiece"},
            {type : "recieveStreamPiece", response : "cacheStreamPiece" },
            {type : "getStreamers", response : "sendStreamers" },
            {type : "recieveStreamers", response : "cacheStreamers" },
            
        ],
        responses = {
            sendCatalogue : function(streamer, data) {
                makeRequest(streamer, {type : "1", payload : JSON.stringify(DataManager.getMyCatalogue())});
            },
            storeCatalogue : function(streamer, data) {
                remoteCatalogue[streamer] = JSON.parse(data.payload);
            },
            requestStreamPiece : function(streamer, data) {
                for(var i = 0; i < data.pieces.length; i++) {
                    queue.push({
                        streamer : streamer,
                        type : "3",
                        pieceID : data.pieces[i]
                    });
                }
                processQueue();

            },
            cacheStreamPiece : function(streamer, data) {
                DataManager.cachePiecesInMemory(data.pieces);
            },
            sendStreamers : function(streamer, data) {
                makeRequest(streamer, {type : "5", payload : streamers});
                streamers[streamer] = Date.now();
                makeRequest(streamer, {type : 0});
                updateStreamers();

            },
            cacheStreamers : function(streamer, data) {
                for (var streamer in data.payload) { streamers[streamer] = data.payload[streamer]; }
                getRemoteCataloges();
            }

        };

    var processQueue = function() {
        var nextItem = queue.shift();
        if(nextItem) {
            if(nextItem.type === "3") {
                DataManager.getPiece(nextItem.pieceID, function(pieceID, piece) {

                    var pieces = {};
                    pieces[pieceID] = piece;   
                    makeRequest(nextItem.streamer, {type : "3", pieces : pieces});    
                
                });
                
            }
        }

    };

    var connectToSignallingHost = function(callback) {

        var peer = new Peer("", {host: 'aqueous-refuge-7092.herokuapp.com', secure:true, port:443, path: '/'});
        
        peer.on("open", function(id) {
            console.log("helel", id);
            if(callback) {
                callback(id);
            }
        });

        peer.on('connection', function(conn) {
            conn.on('data', function(data){
                console.log("receive reqest", data, conn);
                recieveRequest(data, conn);
            });
        });

        return peer;
    };
   

    var getRemoteCataloges = function() {
        for(var streamer in streamers) {
            if(streamer != peer.id) {
                makeRequest(streamer, {type : 0});    
            }
        }
    };

    var updateStreamers = function() {
        for(var streamer in streamers) {
            if(streamer != peer.id) {
                makeRequest(streamer, {type : "5", payload : streamers});
            }
        }
    };

    var getStreamers = function(callback, group) {
        makeRequest(group, {type : 4});
    };

    var makeRequest = function(streamer, action) {
        var conn = peer.connect(streamer);
        console.log("make request", streamer, action);
        conn.on('open', function(){
            conn.send(action);
            processQueue();
        });         
    };

    var recieveRequest = function(data, conn) {
        var requestType = data.type;
        var streamer = conn.peer;
        for(var i = 0; i < actions.length; i++) {
            if(String(requestType) === String(i)) {
                responses[actions[i].response](streamer, data);
            }
        }
    };

    var getStoredCatalogues = function() {
        var mergedCatalogue = [];
        for(var remoteCatalogueStreamer in remoteCatalogue) {
            mergedCatalogue = mergedCatalogue.concat(remoteCatalogue[remoteCatalogueStreamer]);
        }
        return mergedCatalogue;
    };

    var searchCatalogueForItem = function(item) {
        for(var remoteCatalogueStreamer in remoteCatalogue) {
            var catalogue = remoteCatalogue[remoteCatalogueStreamer];
            for(var i = 0; i < catalogue.length; i++) {
                if(catalogue[i].name === item.name &&
                   catalogue[i].season === item.season &&
                   catalogue[i].episode === item.episode) {
                    return {
                        streamer : remoteCatalogueStreamer,
                        data : catalogue[i]
                    };
                }
            }
        }
    };

    var getVideo = function(item) {

        var catalogueEntry = searchCatalogueForItem(item);
        if(catalogueEntry) {
            makeRequest(catalogueEntry.streamer, {type : "2", pieces : catalogueEntry.data.pieces});
            videoPieceQueue = catalogueEntry.data.pieces;
            return true;
        } else {
            return "failed no streamer found with that in their catalogue";
        }

    };

    var getVideoData = function(callback) {
        var nextPiece = videoPieceQueue[0];
        DataManager.getPiece(nextPiece, function(pieceID, piece) {
            if(pieceID && videoPieceQueue.length > 0) {
                videoPieceQueue.shift();
                callback(pieceID, piece);
            } else if(!pieceID && videoPieceQueue.length === 0) {
                callback("finished");
            } else {
                callback();
            }
        });
    };

    var getStreamerCount = function() {
        return Object.keys(streamers).length;
    };

    var getMediaCount = function() {
        return Object.keys(remoteCatalogue).length;
    };

    var init = function() {

        var hash = window.location.hash;
        var group = hash.split("=")[1];
        peer = connectToSignallingHost(function(id) {
            console.log("test");
            if(!group) {
                window.location.hash = "?group="+id;
                streamers[id] = Date.now();
            } else {
                getStreamers(getRemoteCataloges, group);    
            }
        });
        
    };

    init();

    return {
        getStoredCatalogues : getStoredCatalogues,
        cacheStreamFile : DataManager.cacheStreamFile,
        cachePiece : DataManager.cachePiece,
        getVideo : getVideo,
        getVideoData : getVideoData,
        loadLocalFile : DataManager.loadLocalFile,
        getStreamerCount : getStreamerCount,
        getMediaCount : getMediaCount
    }
});

