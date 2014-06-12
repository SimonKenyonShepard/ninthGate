require(["streamManager", "streamHeader", "streamUploader", "streamGrid", "streamStage"], function(streamer, StreamHeader, InfoBox, StreamGrid, StreamStage) {

    window.MediaSource = window.MediaSource || window.WebKitMediaSource;
    if (!!!window.MediaSource) {
      alert('MediaSource API is not available');
    }

    var dataURItoBlob = function(dataURI) {
        var binary = atob(dataURI);
        var array = [];
        for(var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        //return new Blob([new Uint8Array(array)], {type: 'video/webm'});
        return new Uint8Array(array);
    };

    var StreamApp = React.createClass({

        _initialState : {
            catalogue : [],
                uploader : {
                    loadLocalFile : streamer.loadLocalFile
                },
                stage : {
                    visible : "hidden",
                    sourceBuffer : "",
                    videoData : new MediaSource(),
                    action : ""
                }
        },

        getInitialState : function() {
            return this._initialState;
        },

        tick: function() {
            var newCatalogue = streamer.getStoredCatalogues();
            var that = this;
            if(this.state.catalogue.length !== newCatalogue.length) {
                this.setState({catalogue: streamer.getStoredCatalogues()});
            }
            if(this._initialState.stage.videoAction === "downloading") {
                if(this._initialState.stage.sourceBuffer === "") {
                    this._initialState.stage.sourceBuffer = this._initialState.stage.videoData.addSourceBuffer('video/webm; codecs="vorbis,vp8"');
                }
                streamer.getVideoData(function(pieceID, piece) {
                    if(pieceID === "finished") {
                        console.log("end of stream called");
                        that._initialState.stage.videoData.endOfStream();
                        that._initialState.stage.videoAction = "loaded";
                    } else if (pieceID !== undefined) {
                        console.log("appending", pieceID, dataURItoBlob(piece).length);
                        //console.log(atob(piece));
                        console.log(that._initialState.stage.sourceBuffer);
                        that._initialState.stage.sourceBuffer.appendBuffer(dataURItoBlob(piece));
                    }
                });
            }
        },

        componentDidMount: function() {
            this.interval = setInterval(this.tick, 1000);
        },
        
        componentWillUnmount: function() {
            clearInterval(this.interval);
        },

        selectStream : function(event) {
            var show = event.target.innerHTML.split(":");
            var item = {
                "name" : show[0].trim(),
                "season" : show[1].trim(),
                "episode" : show[2].trim()
            };
            streamer.getVideo(item);
            this._initialState.stage.visible = "show";
            this._initialState.stage.videoAction = "downloading";
            console.log("appending source buffer");
            this.setState({stage : this._initialState.stage});


        },

        render: function() {

            var mainContainer = React.DOM.div({
                                                className : "row",
                                                children : [
                                                    InfoBox(this.state),
                                                    React.DOM.div({
                                                                    className : "col-md-9",
                                                                    children : [
                                                                        StreamStage(this.state.stage),
                                                                        StreamGrid({catalogue : this.state.catalogue, clickEvent : this.selectStream})
                                                                    ]
                                                    })
                                                ]
                                            });
            
            return (
                React.DOM.div({
                    children : [
                        StreamHeader(this.state),
                        mainContainer

                    ]
                })
            );
          }
    });

    React.renderComponent(
        StreamApp({}),
        $(".streamApp")[0]
    );


});