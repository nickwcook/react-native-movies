import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { movies } from '../data';
import MoviePoster from './MoviePoster';
import MoviePopup from './MoviePopup';

export default class Movies extends React.Component {

    constructor() {
        super();

        this.state = {
            title: 'Movies',
            popupIsOpen: false
        }
    }

    openMovie = (movie) => {
        this.setState({
            popupIsOpen: true,
            movie
        })
    }

    closeMovie = _ => {
        this.setState({
            popupIsOpen: false
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}>
                    {movies.map((movie, index) => <MoviePoster
                        movie={movie}
                        onOpen={this.openMovie}
                        key={index}
                    />)}
                </ScrollView>
                <MoviePopup
                    movie={this.state.movie}
                    isOpen={this.state.popupIsOpen}
                    onClose={this.closeMovie}
                />
            </View>
        )
    }

}

const styles = StyleSheet.create({
    container: {
        paddingTop: 20
    },
    scrollContent: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    }
})