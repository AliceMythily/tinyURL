import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Linking,
  Text,
  SafeAreaView,
  Share,
  ScrollView,
  Alert,
} from 'react-native';
import {Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {NavigationEvents} from 'react-navigation';

export default class HistoryScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storageKeyId: '',
      data: [],
    };
  }

  async componentDidMount() {
    //on load app check for storageKey to fetch items from AsyncStorage
    this.checkStorageKey();
  }

  checkStorageKey = async () => {
    try {
      const retrievedItem = await AsyncStorage.getItem('@storageKeyId');
      const item = JSON.parse(retrievedItem);
      this.setState({storageKeyId: item});
      if (item) {
        //if storage key exist load data to display storage key = potential item in storage
        this.loadData(item + 2);
      }
      return item;
    } catch (error) {
      console.log(error.message);
    }
  };

  loadData = async (item) => {
    //number of item to load + 1 cos index start from 0
    const x = item;
    //array to store data fetched from storage
    let items = [];
    for (let i = 0; i < x; i += 1) {
      //sorage key of items in AsyncStorage each item key is set as @URL+Number
      let newURL = '@URL' + i;
      try {
        const retrievedItem = await AsyncStorage.getItem(newURL);
        const url = JSON.parse(retrievedItem);
        //if item inside storage key not empty pushed to data array
        if (url !== null) {
          items.push(url);
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    //set state to display item
    this.setState({data: items});
  };

  //Pop up to confirm delete
  deleteItemPopUp(key) {
    Alert.alert('You Are About To Delete This Item', 'Confirm Delete', [
      {
        text: 'Yes',
        onPress: () => this.deleteItem(key),
        style: 'cancel',
      },
      {
        text: 'Cancel',
      },
    ]);
  }

  //function to delete item from AsyncStorage
  deleteItem = async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log(error.message);
    }
    //after delete refresh list and display updated list
    this.checkStorageKey();
  };

  //function to share the generated url with available sharing app e.g message in mobile
  share = (url) => {
    Share.share({
      message: 'Hey, check this website out ' + url,
    });
  };

  render() {
    return (
      //safe area ensure item do not get cutoff this is fix for issue occured after iPhone X where there is additional top padding required
      <SafeAreaView style={{}}>
        <View style={styles.header}>
          <NavigationEvents onDidFocus={() => this.checkStorageKey()} />
          <Text style={styles.headerText}>History </Text>
        </View>
        <ScrollView style={styles.scrollView}>
          {this.state.data.length > 0 ? (
            //only display list if data is generated else show empty list view
            this.state.data.map((val) => (
              <View key={val.urlStoreKey} style={styles.itemCont}>
                <Text style={styles.highlight}>Original URL</Text>
                <Text numberOfLines={2} style={styles.sectionDescription}>{val.oriURL}</Text>
                <Text style={styles.highlight}>Generated URL</Text>
                <Text numberOfLines={2} style={styles.sectionDescription}>{val.genURL}</Text>
                <View style={styles.buttons}>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(val.genURL)}
                    style={styles.submitButton}>
                    <Icon name="language" size={25} color="#95abab" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.share(val.genURL)}
                    style={styles.submitButton}>
                    <Icon name="share" size={25} color="#95abab" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => this.deleteItemPopUp(val.urlStoreKey)}
                    style={styles.submitButton}>
                    <Icon name="delete-forever" size={25} color="#95abab" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyListCont}>
              <Icon name="cloud-off" size={85} color="#95abab" />
              <Text style={[styles.highlight, {textAlign: 'center'}]}>
                You have not generated any URL. {'\n'}
                Try generate some URL at Home Tab and check again.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

//this will auto detect users device width 
const deviceWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#fcfaf7',
  },
  emptyListCont: {
    paddingTop: 250,
    paddingHorizontal: 10,
  },
  header: {
    backgroundColor: '#658C0F',
    height: 60,
  },
  headerText: {
    fontSize: 28,
    color: 'white',
    textAlign: 'center',
    marginVertical: 15,
  },
  sectionDescription: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: '400',
    color: '#444',
  },
  itemCont: {
    flex:1,
    width: deviceWidth - 30,
    backgroundColor: '#ffffff',
    marginVertical: 3,
    marginHorizontal: 15,
    padding: 10,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'lightgray',
  },
  submitButton: {
    height: 45,
    width: 45,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
  },
  highlight: {
    fontWeight: '700',
    color: '#444',
  },
  buttons: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  scrollView: {
    backgroundColor: '#fcfaf7',
    height: '100%',
  },
});
