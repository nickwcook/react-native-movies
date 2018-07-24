import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Dimensions, Image, LayoutAnimation, PanResponder, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View } from 'react-native';
import { defaultStyles } from '../styles';

const { width, height } = Dimensions.get('window');
// Default popup height 65% of vh
const defaultHeight = height * 0.65;

export default class MoviePopup extends React.Component {

  static propTypes = {
	isOpen: PropTypes.bool.isRequired,
      movie: PropTypes.object,
      chosenDay: PropTypes.number,
      chosenTime: PropTypes.number,
      onChooseDay: PropTypes.func,
      onChooseTime: PropTypes.func,
      onBook: PropTypes.func,
      onClose: PropTypes.func,
  }

  state = {
    // Animate popup on close/open based on isOpen
    position: new Animated.Value(this.props.isOpen ? 0 : height),
    // Backdrop opacity
    opacity: new Animated.Value(0),
    // Change popup height on pull gesture
    height: defaultHeight,
    // Expanded with larger poster flag
    expanded: false,
    visible: this.props.isOpen,
  }

  // On popup pull, store previous height to calculate new height value during and after gesture
  _previousHeight = 0

  componentWillMount() {
    // Initialise PanResponder to handle move gestures
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // Ignore tap gestures
        if (dx !== 0 && dy === 0) {
          return true;
        }
        return false;
      },
      onPanResponderGrant: (evt, gestureState) => {
            // Store previous height before change
            this._previousHeight = this.state.height;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Pull delta and velocity values for y axis from gestureState
        const { dy, vy } = gestureState;
        // Subtract delta y from previous height to get new height
        let newHeight = this._previousHeight - dy;

        // Movement animation transition
        LayoutAnimation.easeInEaseOut();

        // Switch to expanded mode if popup pulled up above 80% height
        if (newHeight > height - height / 5) {
          this.setState({ expanded: true });
        } else {
          this.setState({ expanded: false });
        }

        // Expand to full height if pulled quickly
        if (vy < -0.75) {
          this.setState({
            expanded: true,
            height: height
          });
        }

        // Close if pulled down quickly
        else if (vy > 0.75) {
          this.props.onClose();
        }
        // Close if pulled below 75% of default height
        else if (newHeight < defaultHeight * 0.75) {
          this.props.onClose();
        }
        // Limit max height to vh
        else if (newHeight > height) {
          this.setState({ height: height });
        }
        else {
          this.setState({ height: newHeight });
        }
      },
      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        const newHeight = this._previousHeight - dy;

        // Close if pulled below default height
        if (newHeight < defaultHeight) {
          this.props.onClose();
        }

        // Update previous height variable
        this._previousHeight = this.state.height;
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Should component block native components from being JS responder
        // true by default, only supported on Android
        return true;
      }
    })
  }

  // Handle state.isOpen changes to open/close
       componentWillReceiveProps(nextProps) {
            // If currently closed
            if (!this.props.isOpen && nextProps.isOpen) {
                  this.animateOpen();
            }
            // If currently open
            else if (this.props.isOpen && !nextProps.isOpen) {
                  this.animateClose();
            }
      }

  // Toggle open
  animateOpen() {
    this.setState({ visible: true }, () => {
      Animated.parallel([
        Animated.timing(
          this.state.opacity, { toValue: 0.5 }
        ),
        Animated.timing(
          this.state.position, { toValue: 0 } // Top of window
        ),
      ]).start();
    })
  }

  // Toggle close
  animateClose() {
    Animated.parallel([
      Animated.timing(
        this.state.opacity, { toValue: 0 } // transparent
      ),
      Animated.timing(
        this.state.position, { toValue: height } // Bottom of window
      ),
    ]).start(() => this.setState({
      // Reset to default values
      height: defaultHeight,
      expanded: false,
      visible: false,
    }));
  }

  getStyles = () => {
    return {
      imageContainer: this.state.expanded ? {
        width: width / 2,
      } : {
        maxWidth: 110,
        marginRight: 10,
      },
      movieContainer: this.state.expanded ? {
        flexDirection: 'column',
        alignItems: 'center',
      } : {
        flexDirection: 'row',
      },
      movieInfo: this.state.expanded ? {
        flex: 0,
        alignItems: 'center',
        paddingTop: 20,
      } : {
        flex: 1,
        justifyContent: 'center',
      },
      title: this.state.expanded ? {
        textAlign: 'center',
      } : {}
    }
  }

  render() {
    const {
      movie,
      chosenDay,
      chosenTime,
      onChooseDay,
      onChooseTime,
      onBook
    } = this.props;
    
    const { title, genre, poster, days, times } = movie || {};
    
    if (!this.state.visible) {
      return null;
    }

    return (
      <View style={styles.container}>
        {/* Close popup if backdrop tapped */}
        <TouchableWithoutFeedback onPress={this.props.onClose}>
          <Animated.View style={[styles.backdrop, { opacity: this.state.opacity }]}/>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.modal, {
            height: this.state.height,
            transform: [{ translateY: this.state.position }, { translateX: 0 }]
          }]}
        >

          {/* Content */}
          <View style={styles.content}>

            {/* Movie poster, title and genre */}
            <View
              style={[styles.movieContainer, this.getStyles().movieContainer]}
              {...this._panResponder.panHandlers}
            >

              {/* Poster */}
              <View style={[styles.imageContainer, this.getStyles().imageContainer]}>
                <Image source={{ uri: poster }} style={styles.image} />
              </View>

              {/* Title and genre */}
              <View style={[styles.movieInfo, this.getStyles().movieInfo]}>
                <Text style={[styles.title, this.getStyles().title]}>{title}</Text>
                <Text style={styles.genre}>{genre}</Text>
              </View>

            </View>

            {/* Showtimes */}
            <View>
              {/* Day */}
              <Text style={styles.sectionHeader}>Day</Text>
              {/* TODO: Add day options here */}
              <Text>Add day options here</Text>
              {/* Time */}
              <Text style={styles.sectionHeader}>Showtime</Text>
              {/* TODO: Add show time options here */}
              <Text>Add show time options here</Text>
            </View>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableHighlight
              underlayColor="#9575CD"
              style={styles.buttonContainer}
              onPress={onBook}
            >
              <Text style={styles.button}>Book Tickets</Text>
            </TouchableHighlight>
          </View>

        </Animated.View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
      
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
  },
  
  modal: {
    backgroundColor: 'white',
  },

  content: {
    flex: 1,
    margin: 20,
    marginBottom: 0,
  },
  
  movieContainer: {
    flex: 1,
    marginBottom: 20,
  },

  imageContainer: {
    flex: 1,
  },

  image: {
    borderRadius: 10,
    ...StyleSheet.absoluteFillObject,
  },

  movieInfo: {
    backgroundColor: 'transparent',
  },

  title: {
    ...defaultStyles.text,
    fontSize: 20,
  },

  genre: {
    ...defaultStyles.text,
    color: '#BBBBBB',
    fontSize: 14,
  },

  sectionHeader: {
    ...defaultStyles.text,
    color: '#AAAAAA',
  },
  
  footer: {
    padding: 20,
  },

  buttonContainer: {
    backgroundColor: '#673AB7',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },

  button: {
    ...defaultStyles.text,
    color: '#FFFFFF',
    fontSize: 18,
  }

})