import React from 'react';
import {
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { scale, moderateScale } from '../utils/responsive';

const COLORS = {
    white: '#FFFFFF',
    // We reuse values from HomeScreen or define them here
    sidemenuHeader: '#ad0761',
};

const Header = ({ setMenuVisible, isLoggedIn, onProfilePress }) => {
    return (
        <ImageBackground
            source={require('../../assets/images/bg-saffron.jpg.jpeg')}
            style={styles.header}
            resizeMode="cover"
        >
            <View style={styles.headerContent}>
                <Image
                    source={require('../assets/images/nadar-mahamai5.png')}
                    style={styles.newHeaderLogo}
                    resizeMode="contain"
                />

                <View style={styles.headerRight}>
                    {isLoggedIn && (
                        <TouchableOpacity
                            onPress={onProfilePress}
                            style={styles.avatarTouch}
                        >
                            <Image
                                source={require('../assets/images/avatar_male.png')}
                                style={styles.headerAvatar}
                            />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.headerMenuBtn}
                        onPress={() => setMenuVisible(true)}
                    >
                        <Icon name="menu" size={28} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + scale(10) : scale(35),
        paddingBottom: scale(12),
        paddingLeft: 0,
        paddingRight: scale(10),
        borderBottomLeftRadius: scale(20),
        borderBottomRightRadius: scale(20),
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    newHeaderLogo: {
        width: scale(320),
        height: scale(75),
        marginLeft: -scale(15),
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: scale(5),
        gap: scale(10),
    },
    headerMenuBtn: {
        padding: scale(5),
    },
    avatarTouch: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    headerAvatar: {
        width: scale(35),
        height: scale(35),
        borderRadius: scale(17.5),
        borderWidth: scale(1.5),
        borderColor: COLORS.white,
    },
});

export default Header;