import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom";
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    Alert,
    SafeAreaView, 
    ScrollView,
    Button,
    Keyboard,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import CustomButton from '../../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import GlobalStyle from '../../styles/GlobalStyle';
import DropdownStyle from '../../styles/DropdownStyle';
import user_struct from '../../global_structures.js';
import {bp_diary_entry} from '../../global_structures.js';
import BPInputComponent from '../../components/BPInputComponent';
import DateTimePicker from '@react-native-community/datetimepicker';
import YoutubePlayer from "react-native-youtube-iframe";


export default function BPDiary({ navigation, route }) {
    const [diary_entry, setDiaryEntry] = useState(bp_diary_entry)

    const [n_inputs, setNInputs] = useState(0);
    const [bp_readings, setBPReadings] = useState([]); //stores a list of objects, each object storing the data for all the fields in a BPInput component. This is also passed as prop to the component to manipulate the state of this scopre.

    const [date, setDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const [help, setHelp] = useState(false)
    const [playing, setPlaying] = useState(false);
    const [videoIndex, setVideoIndex] = useState();
    const [notFound, setNotFound] = useState(false);

    // Used to tell user video has finished. Currently commented as not needed. If by code freeze still not needed then will delete from app
    const onStateChange = useCallback((state) => {
    if (state === "ended") {
        setPlaying(false);
        //Alert.alert("video has finished playing!");
    }
    }, []);

    useEffect(() => {
        getOrCreateBPDiary();
        setDiaryEntry(state => ({ ...state, ["date"]: date }), [])
        findVideoIndex("Blood Pressure Diary"); //CHANGE NAME HERE TO RENDER ANOTHER VIDEO. If name doesnt match exactly with youtube video title then user alerted to contact clinician.
    }, []); 

    useEffect(() => {
        setBPReadings(state => ([...state, {index:n_inputs, time: new Date(), arm: "", systolic: "", diastolic: ""}]) ) //increment number of inputs and then the n_inputs listener in the useEffect above will be triggered and do the necessary side effects
    }, [n_inputs]);

    // Set the video id that matches the video name passed into this function.
    const findVideoIndex = (videoName) => {
        for (var index=0; index < route.params.videos.length; index++) {
            if (route.params.videos[index].name == videoName) {
                setVideoIndex(index);
                return
            }
        }
        setNotFound(true);
    }

    const showHelp = () => {
        return <View styles={styles.video_style}>
                    <Text style={styles.video_text}>{route.params.videos[videoIndex].name}</Text>
                    <YoutubePlayer
                        webViewStyle={ {opacity:0.99} }
                        height={300}
                        play={playing}
                        videoId={route.params.videos[videoIndex].id}
                    />
                </View>
    }

    const toggleHelp = () => {
        if (notFound === false) {
            if (help === true) {
                setHelp(false);
            } else {
                setHelp(true);
            }
        } else {
            Alert.alert("Help Video Not Found. Please contact clinician")
        }
    }

    const getOrCreateBPDiary = async () => {
        try {
            const bp_diary = await AsyncStorage.getItem('BPDiary');
            if (bp_diary == null) {
                console.log("bp diary does not exist yet, creating...");
                AsyncStorage.setItem("BPDiary", JSON.stringify([]));
            }
            else {
                console.log("bp diary: ", bp_diary);
            }
        } catch (error) {
            console.log("bp diary getItem error");
            console.log(error);
        }
    }

    const appendToDiary = async () => {
        // console.log(diary_entry)
        if (Object.values(diary_entry).some(x => x !== '')) {
            try {
                const diary = JSON.parse(await AsyncStorage.getItem('BPDiary'))

                let bp_readings_morning = bp_readings.filter(x => x.time.getHours() < 12);
                let bp_readings_afternoon = bp_readings.filter(x => x.time.getHours() >= 12 && x.time.getHours() < 17);
                let bp_readings_evening = bp_readings.filter(x => x.time.getHours() >= 17);

                for (let i = 0; i < bp_readings_morning.length; i++) {
                    delete bp_readings_morning[i].index;
                } for (let i = 0; i < bp_readings_afternoon.length; i++) {
                    delete bp_readings_afternoon[i].index;
                } for (let i = 0; i < bp_readings_evening.length; i++) {
                    delete bp_readings_evening[i].index;
                }

                let existing_diary_entry = diary.find(x => x.date === diary_entry.date);
                console.log("existing diary entry:\n", existing_diary_entry);

                if (existing_diary_entry != undefined) {
                    diary.splice(diary.indexOf(existing_diary_entry), 1); // this removes the old diary entry
                    console.log("existing_diary_entry.morning:\n", existing_diary_entry.morning);
                    bp_readings_morning = existing_diary_entry.morning.concat(bp_readings_morning);
                    bp_readings_afternoon = existing_diary_entry.afternoon.concat(bp_readings_afternoon);
                    bp_readings_evening = existing_diary_entry.evening.concat(bp_readings_evening);
                }

                let systolic_avg_morning = NaN;
                let diastolic_avg_morning = NaN;
                let systolic_avg_afternoon = NaN;
                let diastolic_avg_afternoon = NaN;
                let systolic_avg_evening = NaN;
                let diastolic_avg_evening = NaN;

                if (bp_readings_morning.length) {
                    systolic_avg_morning = bp_readings_morning.reduce((partialSum, a) => partialSum + parseInt(a.systolic), 0) / bp_readings_morning.length;
                    diastolic_avg_morning = bp_readings_morning.reduce((partialSum, a) => partialSum + parseInt(a.diastolic), 0) / bp_readings_morning.length;
                } if (bp_readings_afternoon.length) {
                    systolic_avg_afternoon = bp_readings_afternoon.reduce((partialSum, a) => partialSum + parseInt(a.systolic), 0) / bp_readings_afternoon.length;
                    diastolic_avg_afternoon = bp_readings_afternoon.reduce((partialSum, a) => partialSum + parseInt(a.diastolic), 0) / bp_readings_afternoon.length;
                } if (bp_readings_evening.length) {
                    systolic_avg_evening = bp_readings_evening.reduce((partialSum, a) => partialSum + parseInt(a.systolic), 0) / bp_readings_evening.length;
                    diastolic_avg_evening = bp_readings_evening.reduce((partialSum, a) => partialSum + parseInt(a.diastolic), 0) / bp_readings_evening.length;
                }

                let final_entry = {
                    key: diary_entry.date.toLocaleDateString('en-GB'),
                    date: diary_entry.date,
                    morning: bp_readings_morning,
                    afternoon: bp_readings_afternoon,
                    evening: bp_readings_evening,
                    morning_systolic_avg: systolic_avg_morning,
                    morning_diastolic_avg: diastolic_avg_morning,
                    afternoon_systolic_avg: systolic_avg_afternoon,
                    afternoon_diastolic_avg: diastolic_avg_afternoon,
                    evening_systolic_avg: systolic_avg_evening,
                    evening_diastolic_avg: diastolic_avg_evening,
                }
                
                console.log("final bp entry:\n", final_entry);
                diary.push(final_entry);
                // console.log(diary)
                await AsyncStorage.setItem("BPDiary", JSON.stringify(diary))
                navigation.navigate("Home");
            } catch (error) {
                console.log(error);
            }
        } else {
            Alert.alert("Diary entry cannot be empty, please put data")
            console.log("empty field in form")
        }
    }

    function addBPInputComponent() {
        // console.log(bp_readings);
        setNInputs(n_inputs + 1);
    } // maybe this will work ??

    return (
        <SafeAreaView style={GlobalStyle.BodyGeneral}>
            <ScrollView keyboardShouldPersistTaps="never" onScrollBeginDrag={Keyboard.dismiss}>
                <View style={GlobalStyle.BodyGeneral}>
                    <Header/>
                    <Text style={[GlobalStyle.CustomFont, styles.text, GlobalStyle.Blue]}>
                        Blood Pressure Diary
                    </Text>
                    
                    <CustomButton
                        title="Help"
                        onPressFunction={() => toggleHelp()}
                        color='#761076'
                    />
                </View>

                <View styles={styles.video_style}>
                    {(help === true && notFound === false) && showHelp()}
                </View>

                <View style={GlobalStyle.BodyGeneral}>
                    {showDatePicker && (
                        <DateTimePicker
                            testID="datePicker"
                            value={date}
                            display="default"
                            style={{minWidth: 200}}
                            onChange={(event, date) => {
                                if (Platform.OS !== 'ios') setShowDatePicker(false);
                                if (date != undefined) {
                                    setDate(date)
                                    setDiaryEntry(state => ({ ...state, ["date"]: date }), [])
                                }
                            }}
                        />
                    )}

                    <CustomButton
                        onPressFunction={() => setShowDatePicker(true)}
                        title="Enter Date"
                        color="#008c8c"
                    />

                    {/* {console.log(bp_readings)} */}
                    {bp_readings.map((input_component, i) => <BPInputComponent key={i} id={input_component.index} bp_readings={bp_readings} setBPReadings={setBPReadings}/>)}

                    <CustomButton 
                        onPressFunction={() => addBPInputComponent()}
                        title="Enter another reading"
                        color="#f96a3e"    
                    />

                    <CustomButton
                        style={{marginTop: 40}}
                        title='Add entry to diary!'
                        color='#1eb900'
                        onPressFunction={() => {
                            appendToDiary();
                        }}
                    />

                    <View style={{display: 'flex', flexDirection: 'column', paddingBottom: 100}}>
                        <CustomButton
                            title='Homepage'
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
    text: {
        fontSize: 30,
        marginBottom: 45,
        textAlign: "center",
    },
    video_style: {
        flex: 1,
        alignItems: 'center',
    }
})