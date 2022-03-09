import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Alert,
    TextInput,
    SafeAreaView,
    ScrollView,
    Keyboard,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import GlobalStyle from '../styles/GlobalStyle';
import Header from '../components/Header';
import {user_struct, health_type_reverse_lookup} from '../global_structures.js';
import DropDownPicker from 'react-native-dropdown-picker';
import DropdownStyle from '../styles/DropdownStyle';


export default function Home({ navigation, route }) {
    const [dynamic_user, setDynamicUser] = useState(user_struct)
    const [stored_user, setStoredUser] = useState(user_struct)

    useEffect(() => {
        getUserData();
    }, []);

    const getUserData = () => {
        console.log(dynamic_user)
        
        try {
            AsyncStorage.getItem('UserData')
                .then(value => {
                    
                    if (value != null) {
                        let user = JSON.parse(value);
                        console.log(user);
                        setStoredUser(user)
                        return user
                    }
                    else {
                        console.log("Profile not set up - redirected to setup page")
                        Alert.alert("Profile not set up - redirecting to setup page")
                        navigation.navigate("ProfileSetup")
                    }
                })
        } catch (error) {
            console.log(error);
        }
    }

    const updateUserData = async () => {
        console.log("UPDATE DATA")
        console.log(dynamic_user)
        if (Object.values(dynamic_user).every(x => x === null || x === '')) {
            Alert.alert('Warning!', 'Please write your data.')
            console.log("All fields empty!")
        } else {
            try {
                console.log(dynamic_user)
                var user = {...stored_user} //create a safe copy of the local storage user object
                for (const key of Object.keys(user)) { //go over every existing record, and replace it ONLY if the current form input is NOT empty.
                    console.log(key)
                    if (key in dynamic_user && dynamic_user[key].length > 0) 
                        user[key] = dynamic_user[key]
                }
                await AsyncStorage.mergeItem('UserData', JSON.stringify(user));
                getUserData()
                console.log("Data updated")
                Alert.alert('Success!', 'Your data has been updated.');
            } catch (error) {
                console.log(error);
            }
        }
    }

    const removeUserData = async () => {
        try {
            console.log("CLEARED UserData - output below")
            getUserData()
            await AsyncStorage.removeItem("UserData");
            navigation.navigate('ProfileSetup');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <SafeAreaView style={styles.body}>
            <ScrollView keyboardShouldPersistTaps="never" onScrollBeginDrag={Keyboard.dismiss}>
                <View style={styles.body}>
                    <Header></Header>
                    <Text style={[GlobalStyle.CustomFont,styles.text,{fontSize: 50, color: "lime"}]}>
                        Profile Settings
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text]}>
                        Welcome {stored_user.name} !
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text]}>
                        You are {stored_user.age} years old.
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text]}>
                        Your height is {stored_user.height} cm
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text]}>
                        Your weight is {stored_user.weight} kg
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text]}>
                        Your NHS number is {stored_user.nhs_number} kg
                    </Text>
                    <Text style={[GlobalStyle.CustomFont,styles.text, {color: "red"}]}>
                        Your diabetes status is: {health_type_reverse_lookup[route.params?.stored_user.health_type]}
                    </Text>

                    <Text style={[GlobalStyle.CustomFont, styles.text, {color: "red"}]}>
                        Your daily number of injections is {route.params?.stored_user.daily_injections}
                    </Text>
                    

                    <TextInput
                        style={GlobalStyle.InputField}
                        placeholder= {"Update your name"}
                        onChangeText={(value) => setDynamicUser(state => ({ ...state, ["name"]:value }), [])} //updating the dict
                    />
                    <TextInput
                        style={GlobalStyle.InputField}
                        placeholder={"Update your age"}
                        onChangeText={(value) => setDynamicUser(state => ({ ...state, ["age"]:value }), [])}
                    />
                    <TextInput
                        style={GlobalStyle.InputField}
                        placeholder={"Update your height"}
                        onChangeText={(value) => setDynamicUser(state => ({ ...state, ["height"]:value }), [])}
                    />
                    <TextInput
                        style={GlobalStyle.InputField}
                        placeholder={"Update your weight"}
                        onChangeText={(value) => setDynamicUser(state => ({ ...state, ["weight"]:value }), [])}
                    />
                    <TextInput
                        style={GlobalStyle.InputField}
                        placeholder= {"Update your NHS number"}
                        onChangeText={(value) => setDynamicUser(state => ({ ...state, ["nhs_number"]:value }), [])} //updating the dict
                    />
            
                    <CustomButton
                        style={{marginTop: 40}}
                        title='Update Profile'
                        color='#ff7f00'
                        onPressFunction={updateUserData}
                    />
                    <CustomButton
                        title='Delete Profile'
                        color='#f40100'
                        onPressFunction={removeUserData}
                    />

                    <View style={{display: 'flex', flexDirection: 'column', paddingBottom: 100}}>
                        <CustomButton
                            title='Return to Homepage'
                            color='#761076'
                            onPressFunction={() => navigation.navigate("Home")}
                        />
                    </View>
                </View>
            </ScrollView>      
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#e9c5b4',
    },
    text: {
        fontSize: 40,
        margin: 10,
        textAlign: 'center',
    },
})