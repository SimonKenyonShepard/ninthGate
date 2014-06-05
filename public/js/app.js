require(["streamManager", "streamHeader", "streamUploader", "streamGrid", "streamStage"], function(streamer, StreamHeader, InfoBox, StreamGrid, StreamStage) {

    var StreamApp = React.createClass({

        _initialState : {
            catalogue : [],
                uploader : {
                    cacheStreamFile : streamer.cacheStreamFile,
                    cachePiece : streamer.cachePiece
                },
                stage : {
                    visible : "hidden",
                    videoID : "",
                    videoData : ""
                }
        },

        getInitialState : function() {
            return this._initialState;
        },

        tick: function() {
            var newCatalogue = streamer.getStoredCatalogues();
            if(this.state.catalogue.length !== newCatalogue.length) {
                this.setState({catalogue: streamer.getStoredCatalogues()});
            }
            if(this.state.stage.videoID !== "" && this.state.stage.videoData === "") {
                var videoData = streamer.getVideoData(this.state.stage.videoID);
                if(videoData) {
                    this._initialState.stage.videoData = videoData;
                    this.setState({stage : this._initialState.stage});
                }
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
            var id = streamer.getVideo(item);
            this._initialState.stage.visible = "show";
            this._initialState.stage.videoID = id;
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