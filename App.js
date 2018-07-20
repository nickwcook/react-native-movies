import React from 'react';
import { createStackNavigator } from 'react-navigation';
import Movies from './src/components/Movies';
import PageTwo from './src/components/PageTwo';

const Navigator = createStackNavigator(
	{
		Movies: {
			screen: Movies,
			// navigationOptions: ({ navigation }) => ({
			// 	title: `${navigation.state.title}`
			// })
			navigationOptions: () => {
				title: 'Movies'
			}
		},
		PageTwo: {
			screen: PageTwo
		}
	},
	{
		initialRouteName: 'Movies'
	}
)

export default class App extends React.Component {

	render() {
		return (
			<Navigator />
		)
	}

}