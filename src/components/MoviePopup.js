import React from 'react';
import PropTypes from 'prop-types';
import { Animated, Dimensions, Image, LayoutAnimation, PanResponder, StyleSheet, Text, TouchableHighlight, TouchableWithoutFeedback, View } from 'react-native';
import { defaultStyles } from '../styles';

const { width, height } = Dimensions.get('window');
const defaultHeight = height * 0.67;

export default class MoviePopup extends React.Component {

    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        movie: PropTypes.object,
        chosenDay: PropTypes.number,
        chosenTime: PropTypes.number,
        onChooseDay: PropTypes.func,
        onChooseTime: PropTypes.func,
        onBook: PropTypes.func,
        onClose: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.state = {
            position: new Animated.Value(this.props.isOpen ? 0 : height),
            opacity: new Animated.Value(0),
            height: defaultHeight,
            expanded: false,
            visible: this.props.isOpen
        }
    }

    previousHeight = 0;

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (event, getstureState) => true,
            onMoveShouldSetPanResponder: (event, gestureState) => {
                const { dx, dy } = getstureState;
                
                if (dx !== 0 && dy === 0) {
                    return true;
                } else {
                    return false;
                }
            },
            onPanResponderGrant: (event, gestureState) => {
                this.previousHeight = this.state.height;
            },
            onPanResponderMove: (event, gestureState) => {
                const { dy, dv } = gestureState;

                let newHeight = this.previousHeight - dy;

                LayoutAnimaton.easeInOut();

                if (newHeight > height - height / 5) {
                    this.setState({
                        expanded: true
                    })
                } else {
                    this.setState({
                        expanded: false
                    })
                }

                if (vy < -0.75) {
                    this.setState({
                        expanded: true,
                        height: height
                    })
                } else if (vy > 0.75) {
                    this.props.onClose();
                } else if (newHeight < defaultHeight * 0.75) {
                    this.props.onClose();
                } else if (newHeight > height) {
                    this.setState({
                        height: height
                    })
                } else {
                    this.setState({
                        height: newHeight
                    })
                }
            },
            onPanResponderTerminationRequest: (event, gestureState) => true,
            onPanResponderRelease: (event, gestureState) => {
                const { dy } = gestureState;
                const newHeight = this.previousHeight - dy;

                if (newHeight < defaultHeight) {
                    this.props.onClose();
                }

                this.previousHeight = this.state.height;
            },
            onShouldBlockNativeResponder: (event, gestureState) => {
                return true;
            }
        })
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isOpen && nextProps.isOpen) {
            this.animateOpen();
        } else if (this.props.isOpen && !nextProps.isOpen) {
            this.animateClose();
        }
    }

    animateOpen() {
        this.setState({
            visible: true
        }, _ => {
            Animated.parallel([
                Animated.timing(
                    this.state.opacity, { toValue: 0.5 }
                ),
                Animated.timing(
                    this.state.position, { toValue: 0 }
                )
            ]).start()
        })
    }

    animateClose() {
        Animated.parallel([
            Animated.timing(
                this.state.opacity, { toValue: 0 }
            ),
            Animated.timing(
                this.state.position, { toValue: height }
            )
        ]).start(_ => this.setState({
            height: defaultHeight,
            expanded: false,
            visible: false
        }))
    }

    getStyles() {
        return {
            imageContainer: this.state.expanded ? {
                width: width / 2
            } : {
                maxWidth: 110,
                marginRight: 10
            },
            movieContainer: this.state.expanded ? {
                flexDirection: 'column',
                alignItems: 'center',
            } : {
                flexDirection: 'row'
            },
            movieInfo: this.state.expanded ? {
                flex: 0,
                alignItems: 'center',
                paddingTop: 20
            } : {
                flex: 1,
                justifyContent: 'center'
            },
            title: this.state.expanded ? {
                textAlign: 'center'
            } : {

            }
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

        const {
            title,
            genre,
            poster,
            days,
            times
        } = movie || {};

        if (!this.state.visible) {
            return null;
        }

        return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={this.props.onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: this.state.opacity }]}/>
                </TouchableWithoutFeedback>
                <Animated.View style={[styles.modal, { transform: [{ translateY: this.state.position}, {translateX: 0 }] }]}>
                    <View style={styles.content}>
                        {/* Movie poster, title, genre */}
                        <View style={[styles.movieContainer, this.getStyles().movieContainer]} {...this.panResponder.panHandlers}>
                            {/* Poster */}
                            <View style={[styles.imageContainer, this.getStyles().imageContainer]}>
                                <Image source={{uri: poster}} style={styles.image} />
                            </View>
                            {/* Title and genre */}
                            <View style={[styles.movieInfo, this.getStyles().movieInfo]}>
                                <Text style={[styles.title, this.getStyles().title]}>{title}</Text>
                                <Text style={styles.genre}>{genre}</Text>
                            </View>
                        </View>
                        {/* Showing times */}
                        <View>
                            {/* Day */}
                            <Text style={styles.sectionHeader}>Day</Text>
                            {/* TODO: App day options */}
                            <Text>Add day options here</Text>
                            {/* Time */}
                            <Text style={styles.sectionHeader}>Time</Text>
                            {/* TODO: Add showing time options */}
                            <Text>Add showing time options here</Text>
                        </View>
                    </View>
                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableHighlight underlayColor="#9575cd" style={styles.buttonContainer} onPress={onBook}>
                            <Text style={styles.button}>Book Tickets</Text>
                        </TouchableHighlight>
                    </View>
                </Animated.View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent'
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black'
    },
    modal: {
        backgroundColor: 'white'
    },
    content: {
        flex: 1,
        margin: 20,
        marginBottom: 0
    },
    // Movie container
    movieContainer: {
        flex: 1,
        marginBottom: 20
    },
    imageContainer: {
        flex: 1,
    },
    image: {
        borderRadius: 10,
        ...StyleSheet.absoluteFillObject
    },
    movieInfo: {
        backgroundColor: 'transparent'
    },
    title: {
        ...defaultStyles.text,
        fontSize: 20
    },
    genre: {
        ...defaultStyles.text,
        color: '#BBBBBB',
        fontSize: 14
    },
    sectionHeader: {
        ...defaultStyles.text,
        color: '#AAAAAA'
    },
    // Footer
    footer: {
        padding: 20
    },
    buttonContainer: {
        backgroundColor: '#673AB7',
        borderRadius: 100,
        paddingVertical: 10,
        paddingHorizontal: 15,
        alignItems: 'center'
    },
    button: {
        ...defaultStyles.text,
        color: '#FFFFFF',
        fontSize: 18
    }
})