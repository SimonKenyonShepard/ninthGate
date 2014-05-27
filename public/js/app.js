require(["streamManager", "streamHeader", "streamUploader", "streamGrid", "streamStage"], function(streamer, StreamHeader, InfoBox, StreamGrid, StreamStage) {

    var StreamApp = React.createClass({
        getInitialState : function() {
            return {
                catalogue : [],
                uploader : {
                    cacheStreamFile : streamer.cacheStreamFile    
                },
                stage : {
                    visible : "hidden",
                    videoID : null,
                    videoData : null
                }
                 
            };
        },

        tick: function() {
            this.setState({catalogue: streamer.getStoredCatalogues()});
            if(this.state.stage.videoID !== null && this.state.stage.videoData !== null) {
                var videoData = streamer.getVideoData(this.state.stage.videoID);
                if(videoData) {
                    this.setState({stage : {videoData : videoData}});
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
            console.log("click event fired");
            var show = event.target.innerHTML.split(":");
            var item = {
                "name" : show[0].trim(),
                "season" : show[1].trim(),
                "episode" : show[2].trim()
            };
            var id = streamer.getVideo(item);
            this.setState({stage : {visible : "show", videoID : id}});
        },

        render: function() {

            var mainContainer = React.DOM.div({
                                                className : "row",
                                                children : [
                                                    InfoBox(this.state),
                                                    React.DOM.div({
                                                                    className : "col-md-9",
                                                                    children : [
                                                                        StreamStage(this.state),
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