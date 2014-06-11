define(["md5baseJS", "dataManager"], function(md5, DataManager) {

    var peer,
        streamers,
        remoteCatalogue = {},
        queue = [],
        videoPieceQueue : [],
        actions = [
            {type : "getCatalogue", response : "sendCatalogue" },
            {type : "recieveCatalogue", response : "storeCatalogue"},
            {type : "sendStreamPiece", response : "requestStreamPiece"},
            {type : "recieveStreamPiece", response : "cacheStreamPiece" }
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

    var connectToSignallingHost = function() {

        var peer = new Peer("", {host: '192.168.178.43', port: 9000, path: '/myapp'});
        
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
            makeRequest(streamer, {type : 0});
        }
    };

    var getStreamers = function(callback) {
        $.getJSON("/streamers", function(data) {
            streamers = data;
            callback(data);
        });
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


    var init = function() {

        peer = connectToSignallingHost();
        getStreamers(getRemoteCataloges);

    };

    init();

    return {
        getStoredCatalogues : getStoredCatalogues,
        cacheStreamFile : DataManager.cacheStreamFile,
        cachePiece : DataManager.cachePiece,
        getVideo : getVideo,
        getVideoData : DataManager.getVideoData,
        loadLocalFile : DataManager.loadLocalFile,
    }
});

