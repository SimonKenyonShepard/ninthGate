define(["md5baseJS"], function(md5) {

    var peer,
        streamers,
        myCatalogue = [],
        remoteCatalogue = {},
        streamData = {},
        actions = [
            {type : "getCatalogue", response : "sendCatalogue" },
            {type : "recieveCatalogue", response : "storeCatalogue"},
            {type : "sendStreamPiece", response : "requestStreamPiece" },
            {type : "recieveStreamPiece", response : "cacheStreamPiece" }
        ],
        responses = {
            sendCatalogue : function(streamer, data) {
                makeRequest(streamer, {type : "1", payload : JSON.stringify(myCatalogue)});
            },
            storeCatalogue : function(streamer, data) {
                remoteCatalogue[streamer] = JSON.parse(data.payload);
            },
            requestStreamPiece : function(streamer, data) {
                var pieces = {};
                for(var i = 0; i < data.pieces.length; i++) {
                    pieces[data.pieces[i]] = streamData[data.pieces[i]];
                }
                makeRequest(streamer, {type : "3", pieces : pieces});

            },
            cacheStreamPiece : function(streamer, data) {
                cachePieces(data.pieces);
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

    var cacheStreamFile = function(hashes, series, seasonAndEpisode) {

        var id = md5(series.trim()+seasonAndEpisode.split(":")[0].trim()+seasonAndEpisode.split(":")[1].trim());
        myCatalogue.push({
            "name" : series.trim(),
            "season" : seasonAndEpisode.split(":")[0].trim(),
            "episode" : seasonAndEpisode.split(":")[1].trim(),
            "lang" : "en",
            "pieces" : hashes,
            "id" : id                
        });
        console.log(myCatalogue);

    };

    var cachePieces = function(pieces) {
        for(var piece in pieces) {
            if(md5(pieces[piece]) === piece) {
                cachePiece(piece, pieces[piece]);
                console.log("cached valid piece");    
            } else {
                console.log("invalid piece received");
            }
            
        }
    };

    var cachePiece = function(hash, piece) {
        streamData[hash] = piece;
    };

    var getVideo = function(item) {

        var catalogueEntry = searchCatalogueForItem(item);
        if(catalogueEntry) {
            makeRequest(catalogueEntry.streamer, {type : "2", pieces : catalogueEntry.data.pieces});
            return catalogueEntry.data.pieces;
        } else {
            return "failed no streamer found with that in their catalogue";
        }

    };

    var getVideoData = function(pieces) {

        var allPieces = ["data:video/webm;base64,"];
        for(var i = 0; i < pieces.length; i++) {
            if(streamData[pieces[i]]) {
                allPieces.push(streamData[pieces[i]]);
            }
        }
        if(allPieces.length === pieces.length+1) {
            return allPieces;
        } else {
            return false;
        }
    };

    var init = function() {

        peer = connectToSignallingHost();
        getStreamers(getRemoteCataloges);

    };

    init();

    return {
        getStoredCatalogues : getStoredCatalogues,
        cacheStreamFile : cacheStreamFile,
        cachePiece : cachePiece,
        getVideo : getVideo,
        getVideoData : getVideoData
    }
});

