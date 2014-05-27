define([], function() {

    var videoPlayer = React.createClass({
        render: function() {
            return (
                React.DOM.video({
                    className: 'streamPlayer',
                    controls : "true",
                    src : this.props.stage.videoData
                })
            );
          }
    });

    return React.createClass({
        
        render: function() {
            
            var stageTitle = React.DOM.h4({}," Series name");
            var stage = React.DOM.div({
                  className : "row streamStage " + this.props.stage.visible
                }, [stageTitle, videoPlayer(this.props)]);

            return (
                React.DOM.div({
                    children : stage
                })
            );
          }
    });
});