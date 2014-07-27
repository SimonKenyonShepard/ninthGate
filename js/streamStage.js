define([], function() {

    var videoPlayer = React.createClass({

        render: function() {
            console.log("render video");
            return (
                React.DOM.video({
                    className: 'streamPlayer',
                    controls : "true",
                    src : window.URL.createObjectURL(this.props.videoData)
                })
            );
          }
    });

    return React.createClass({
        
        render: function() {
            
            var stageTitle = React.DOM.h4({},this.props.seriesName);
            var stage = React.DOM.div({
                  className : "row streamStage " + this.props.visible
                }, [stageTitle, videoPlayer(this.props)]);

            return (
                React.DOM.div({
                    children : stage
                })
            );
          }
    });
});