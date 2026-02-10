import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

// Enhanced Input Component with better styling
const ModernInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, icon, secureTextEntry = false, rightIcon = null, onRightIconPress = null }) => (
    <View style={styles.inputContainerModern}>
        <Text style={styles.inputLabelModern}>{label}</Text>
        <View style={[styles.inputWrapperModern, multiline && styles.textAreaWrapperModern]}>
            {icon && <Icon name={icon} size={20} color="#EC4899" style={styles.inputIconModern} />}
            <TextInput
                style={[styles.textInputModern, multiline && styles.textAreaModern, rightIcon && styles.inputWithRightIcon]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                keyboardType={keyboardType}
                multiline={multiline}
                placeholderTextColor="#9CA3AF"
                secureTextEntry={secureTextEntry}
            />
            {rightIcon && (
                <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
                    <Icon name={rightIcon} size={20} color="#6B7280" />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

const ModernSelect = ({ label, value, icon, items = [], onChange = () => { } }) => (
    <View style={styles.inputContainerModern}>
        <Text style={styles.inputLabelModern}>{label}</Text>
        <View style={styles.selectWrapperModern}>
            {icon && (
                <Icon
                    name={icon}
                    size={20}
                    color="#EC4899"
                    style={styles.inputIconModern}
                />
            )}
            <Picker
                selectedValue={value}
                style={styles.pickerModern}
                dropdownIconColor="#EC4899"
                onValueChange={(itemValue) => onChange(itemValue)}
            >
                <Picker.Item label="தேர்வு செய்யவும்" value="" />
                {items.map((item, index) => (
                    <Picker.Item
                        key={index}
                        label={item.label}
                        value={item.value}
                    />
                ))}
            </Picker>
        </View>
    </View>
);

const RegistrationScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [currentStep, setCurrentStep] = useState(0);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const otpInputs = useRef([]);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [formData, setFormData] = useState({
        martialStatus: "",
        marriageType: '',       // Widow | Divorce
        marriageReason: '',
        hasChildren: '',        // Yes | No
        children: [],           // [{ gender: '', age: '' }]
        name: '',
        gender: 'Male',
        motherTongue: 'தமிழ்',
        fatherName: '',
        motherName: '',
        phone1: '',
        phone2: '',
        dob: '',
        birthTime: '',
        birthPlace: '',
        nativePlace: '',
        district: '',
        city: '',
        religion: '',
        rasi: '',
        star: '',
        direction: '',
        gothram: '',
        familyDeity: '',
        complexion: '',
        heightFt: '',
        heightIn: '',
        education: '',
        job: '',
        workPlace: '',
        income: '',
        aboutSelf: '',
        brothers: '0',
        marriedBrothers: '0',
        sisters: '0',
        marriedSisters: '0',
        expectations: '',
        email: '',
    });



    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [currentStep]);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAcceptTerms = () => {
        setCurrentStep(1);
    };

    const handleReject = () => {
        navigation.goBack();
    };

    const handleNext = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (!showOtpInput) {
                setShowOtpInput(true);
                setTimeout(() => otpInputs.current[0]?.focus(), 400);
            } else {
                setCurrentStep(3); // Move to password setup
                setShowOtpInput(false);
            }
        } else if (currentStep === 3) {
            // Password setup complete, move to success
            setCurrentStep(4);
        }
    };

    const handleBack = () => {
        if (currentStep === 2 && showOtpInput) {
            setShowOtpInput(false);
            setOtp(['', '', '', '']);
        } else if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            if (currentStep === 3) {
                setShowOtpInput(true);
            }
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = () => {
        Alert.alert('வெற்றி!', 'பதிவு முடிந்தது', [{ text: 'சரி', onPress: () => navigation.navigate('Home') }]);
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) otpInputs.current[index + 1]?.focus();
    };

    // Terms Screen
    const renderTerms = () => (
        <View style={styles.termsContainer}>
            <LinearGradient colors={['#E0F2FE', '#FFFFFF']} style={styles.termsHeaderModern}>
                <Text style={styles.termsTitleModern}>Terms & Conditions</Text>
            </LinearGradient>

            <ScrollView style={styles.termsContent} showsVerticalScrollIndicator={false}>
                <View style={styles.termsCardModern}>
                    {[
                        'தூத்துக்குடி நாடார்கள் மகமை திருமண தகவல் நிலையம் சேவை செய்யும் நோக்கில் ஆரம்பிக்கப்பட்டுள்ளது. இது வணிக நோக்கத்திற்காக அல்ல.',
                        'இங்கு எடுக்கும் தகவல்களை தவறான முறையில் பயன்படுத்தக் கூடாது.',
                        'புரோக்கர்கள் பதிவு செய்ய கூடாது.',
                        'திருமணம் உறுதியானால் உடனே அலுவலக முகவரிக்கு தெரியப்படுத்தவும்.',
                        'அரசால் அங்கீகரிக்கப்பட்ட போட்டோ அடையாள சான்றிதழ் (Aadhar Card, Voter ID, Postcard Size Photo – Normal / Maxi).',
                        'Original ஜாதகம் புக் முழுவதும் வேண்டும் (பிறந்த நேரம் உட்பட).',
                        'கல்வி சான்றிதழ்கள் (Conversation / Provisional) இரண்டும் சமர்ப்பிக்க வேண்டும்.',
                        'மாற்றுச்சான்றிதழ் (TC Original). Community இல்லையெனில் Community Certificate / 10th / 12th Marksheet Xerox சேர்க்க வேண்டும்.',
                        'அனைத்து ஆவணங்களையும் அலுவலக மின்னஞ்சல் முகவரிக்கு அனுப்ப வேண்டும்.',
                        'அதிகபட்சமாக 50 ஜாதகம் எடுத்துக்கொள்ளலாம்.',
                        'பதிவு கட்டணம் (DD / Money Order / Net Transfer) மூலம் அனுப்ப வேண்டும்.',
                        'பதிவுக்குப் பின் ஊர் மற்றும் போன் நம்பர் வழங்கப்படும்.',
                        'பதிவு கட்டணம் ரூ.1000/- (ஆயிரம் ரூபாய்).',
                        'மேற்கண்டவற்றில் ஏதேனும் ஒன்று இல்லையெனில் பதிவு ஏற்றுக்கொள்ளப்படாது.'
                    ].map((item, index) => (
                        <View key={index} style={styles.termItemModern}>
                            <View style={styles.termBulletModern}>
                                <Text style={styles.termNumberModern}>{index + 1}</Text>
                            </View>
                            <Text style={styles.termTextModern}>{item}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <View style={styles.termsButtonContainer}>
                <TouchableOpacity style={styles.rejectBtnModern} onPress={handleReject}>
                    <Text style={styles.rejectTextModern}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.acceptBtnModern} onPress={handleAcceptTerms}>
                    <LinearGradient colors={['#EC4899', '#BE185D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.acceptGradientModern}>
                        <Text style={styles.acceptTextModern}>Accept</Text>
                        <Icon name="arrow-right" size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );

    // Step Progress Indicator
    const renderStepIndicator = () => {
        const totalSteps = 3; // Form steps (Basic, Work, Password)
        const currentFormStep = currentStep === 1 ? 1 : currentStep === 2 ? 2 : currentStep === 3 ? 3 : 1;

        return (
            <View style={styles.stepIndicatorContainer}>
                <View style={styles.stepIndicatorRow}>
                    {[1, 2, 3].map((step, index) => (
                        <React.Fragment key={step}>
                            <View style={[
                                styles.stepCircle,
                                currentFormStep >= step && styles.stepCircleActive
                            ]}>
                                <Text style={[
                                    styles.stepNumber,
                                    currentFormStep >= step && styles.stepNumberActive
                                ]}>
                                    {step}
                                </Text>
                            </View>
                            {index < 2 && (
                                <View style={[
                                    styles.stepConnector,
                                    currentFormStep > step && styles.stepConnectorActive
                                ]} />
                            )}
                        </React.Fragment>
                    ))}
                </View>
                <View style={styles.stepLabelRow}>
                    <Text style={[styles.stepLabel, currentFormStep >= 1 && styles.stepLabelActive]}>அடிப்படை</Text>
                    <Text style={[styles.stepLabel, currentFormStep >= 2 && styles.stepLabelActive]}>வேலை</Text>
                    <Text style={[styles.stepLabel, currentFormStep >= 3 && styles.stepLabelActive]}>கடவுச்சொல்</Text>
                </View>
            </View>
        );
    };
    const isMale = formData.gender === 'Male';
    const widowLabel = isMale ? 'Widower' : 'Widow';
    const widowTamilLabel = isMale ? 'விதவர்' : 'விதவை';

    // Form Steps (1 & 2 & 3)
    const renderFormSheet = () => (
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }], opacity: fadeAnim }]}>
            <View style={styles.sheetHeader}>
                <View style={styles.sheetHandle} />
                {currentStep <= 3 && renderStepIndicator()}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                {currentStep === 1 && (
                    <View style={styles.formSection}>
                        <Text style={styles.sectionTitle}>அடிப்படை விவரங்கள்</Text>
                        <Text style={styles.sectionSubtitle}>உங்கள் அடிப்படை தகவல்களை பதிவு செய்யவும்</Text>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernInput label="முழு பெயர்" value={formData.name} onChangeText={(t) => updateField('name', t)} placeholder="பெயர்" icon="account" />
                            </View>

                            <View style={styles.formCol}>
                                <ModernSelect
                                    label="பாலினம்"
                                    value={formData.gender}
                                    icon="gender-male-female"
                                    items={[
                                        { label: 'ஆண் (Male)', value: 'Male' },
                                        { label: 'பெண் (Female)', value: 'Female' },
                                    ]}
                                    onChange={(val) => {
                                        updateField('gender', val);
                                        updateField('marriageType', ''); // reset widow/widower when gender changes
                                    }}
                                />


                            </View>
                        </View>
                        <ModernSelect
                            label="திருமண நிலை"
                            value={formData.maritalStatus}
                            icon="ring"
                            items={[
                                { label: 'திருமணம் ஆகவில்லை', value: 'Unmarried' },
                                { label: 'திருமணம் ஆனது', value: 'Married' },
                            ]}
                            onChange={(val) => {
                                updateField('maritalStatus', val);

                                // reset married fields if unmarried
                                if (val !== 'Married') {
                                    updateField('marriageType', '');
                                    updateField('marriageReason', '');
                                    updateField('hasChildren', '');
                                    updateField('children', []);
                                }
                            }}
                        />
                        {formData.maritalStatus === 'Married' && (
                            <View style={styles.marriedCard}>
                                <Text style={styles.marriedTitle}>முந்தைய திருமண விவரங்கள்</Text>

                                {/* Widow / Divorce */}
                                <ModernSelect
                                    label="திருமண நிலை வகை"
                                    value={formData.marriageType}
                                    icon="account-question"
                                    items={[
                                        {
                                            label: `${widowTamilLabel} (${widowLabel})`,
                                            value: widowLabel,
                                        },
                                        {
                                            label: 'விவாகரத்து (Divorce)',
                                            value: 'Divorce',
                                        },
                                    ]}

                                    onChange={(val) => updateField('marriageType', val)}
                                />

                                {/* Reason */}
                                <ModernInput
                                    label="காரணம்"
                                    value={formData.marriageReason}
                                    onChangeText={(t) => updateField('marriageReason', t)}
                                    placeholder="காரணம் குறிப்பிடவும்"
                                    multiline
                                    icon="text"
                                />

                                {/* Has children */}
                                <ModernSelect
                                    label="குழந்தைகள் உள்ளதா?"
                                    value={formData.hasChildren}
                                    icon="baby-face-outline"
                                    items={[
                                        { label: 'ஆம்', value: 'Yes' },
                                        { label: 'இல்லை', value: 'No' },
                                    ]}
                                    onChange={(val) => {
                                        updateField('hasChildren', val);
                                        if (val === 'No') updateField('children', []);
                                    }}
                                />

                                {/* Children details */}
                                {formData.hasChildren === 'Yes' && (
                                    <>
                                        <ModernSelect
                                            label="குழந்தைகள் எண்ணிக்கை"
                                            value={formData.children.length.toString()}
                                            icon="counter"
                                            items={[1, 2, 3, 4].map(n => ({
                                                label: n.toString(),
                                                value: n.toString(),
                                            }))}
                                            onChange={(val) => {
                                                const count = parseInt(val);
                                                updateField(
                                                    'children',
                                                    Array.from({ length: count }, () => ({ gender: '', age: '' }))
                                                );
                                            }}
                                        />

                                        {formData.children.map((child, index) => (
                                            <View key={index} style={styles.childRow}>
                                                <Text style={styles.childTitle}>குழந்தை {index + 1}</Text>

                                                <ModernSelect
                                                    label="பாலினம்"
                                                    value={child.gender}
                                                    icon="gender-male-female"
                                                    items={[
                                                        { label: 'ஆண்', value: 'Male' },
                                                        { label: 'பெண்', value: 'Female' },
                                                    ]}
                                                    onChange={(val) => {
                                                        const updated = [...formData.children];
                                                        updated[index].gender = val;
                                                        updateField('children', updated);
                                                    }}
                                                />

                                                <ModernInput
                                                    label="வயது"
                                                    value={child.age}
                                                    keyboardType="numeric"
                                                    placeholder="வயது"
                                                    icon="calendar"
                                                    onChangeText={(t) => {
                                                        const updated = [...formData.children];
                                                        updated[index].age = t;
                                                        updateField('children', updated);
                                                    }}
                                                />
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        )}

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernInput label="கைபேசி 1" value={formData.phone1} onChangeText={(t) => updateField('phone1', t)} placeholder="9876543210" keyboardType="phone-pad" icon="phone" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernInput label="கைபேசி 2" value={formData.phone2} onChangeText={(t) => updateField('phone2', t)} placeholder="9876543210" keyboardType="phone-pad" icon="phone" />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernInput label="பிறந்த தேதி" value={formData.dob} onChangeText={(t) => updateField('dob', t)} placeholder="DD-MM-YYYY" icon="calendar" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernInput label="பிறந்த நேரம்" value={formData.birthTime} onChangeText={(t) => updateField('birthTime', t)} placeholder="00:00" icon="clock" />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernInput label="தந்தை பெயர்" value={formData.fatherName} onChangeText={(t) => updateField('fatherName', t)} placeholder="தந்தை பெயர்" icon="account-tie" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernInput label="தாய் பெயர்" value={formData.motherName} onChangeText={(t) => updateField('motherName', t)} placeholder="தாய் பெயர்" icon="account-heart" />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernInput label="பிறந்த இடம்" value={formData.birthPlace} onChangeText={(t) => updateField('birthPlace', t)} placeholder="பிறந்த இடம்" icon="map-marker" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernInput label="பூர்வீகஊர்" value={formData.nativePlace} onChangeText={(t) => updateField('nativePlace', t)} placeholder="சொந்த ஊர்" icon="map-marker" />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernSelect label="மாவட்டம்" value={formData.district} icon="map-marker" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernInput label="நகரம்" value={formData.city} icon="map-marker" onChangeText={(t) => updateField('city', t)} />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.formCol}>
                                <ModernSelect label="ராசி" value={formData.rasi} icon="moon-full" />
                            </View>
                            <View style={styles.formCol}>
                                <ModernSelect label="நட்சத்திரம்" value={formData.star} icon="star" />
                            </View>
                        </View>

                        <ModernSelect label="திசை" value={formData.direction} icon="compass" />
                        <ModernInput label="குலதெய்வம்" value={formData.familyDeity} onChangeText={(t) => updateField('familyDeity', t)} icon="temple-hindu" />
                    </View>
                )}

                {currentStep === 2 && (
                    <View style={styles.formSection}>
                        {!showOtpInput ? (
                            <>
                                <Text style={styles.sectionTitle}>வேலை & குடும்பம்</Text>
                                <Text style={styles.sectionSubtitle}>தொழில் மற்றும் குடும்ப விவரங்கள்</Text>

                                <View style={styles.formRow}>
                                    <View style={styles.formCol}>
                                        <ModernSelect label="நிறம்" value={formData.complexion} icon="palette" />
                                    </View>
                                    <View style={styles.formCol}>
                                        <View style={styles.inputContainerModern}>
                                            <Text style={styles.inputLabelModern}>உயரம்</Text>
                                            <View style={styles.heightContainerModern}>
                                                <TextInput
                                                    style={styles.heightInputModern}
                                                    placeholder="அடி"
                                                    value={formData.heightFt}
                                                    onChangeText={(t) => updateField('heightFt', t)}
                                                    keyboardType="numeric"
                                                />
                                                <Text style={styles.heightSlash}>|</Text>
                                                <TextInput
                                                    style={styles.heightInputModern}
                                                    placeholder="அங்"
                                                    value={formData.heightIn}
                                                    onChangeText={(t) => updateField('heightIn', t)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.formRow}>
                                    <View style={styles.formCol}>
                                        <ModernInput label="கல்வி" value={formData.education} onChangeText={(t) => updateField('education', t)} placeholder="B.Sc, M.Com" icon="school" />
                                    </View>
                                    <View style={styles.formCol}>
                                        <ModernSelect label="பணி" value={formData.job} icon="briefcase" />
                                    </View>
                                </View>

                                <ModernInput label="மாத வருமானம்" value={formData.income} onChangeText={(t) => updateField('income', t)} placeholder="₹ ரூபாயில்" keyboardType="numeric" icon="currency-inr" />

                                <View style={styles.siblingsSheetCard}>
                                    <Text style={styles.siblingsTitleSheet}>உடன்பிறப்புகள்</Text>
                                    <View style={styles.siblingCounters}>
                                        <View style={styles.sibItem}>
                                            <Text style={styles.sibLabel}>அண்ணன்/தம்பி</Text>
                                            <View style={styles.counterRow}>
                                                <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('brothers', Math.max(0, parseInt(formData.brothers || 0) - 1).toString())}>
                                                    <Icon name="minus" size={16} color="#EC4899" />
                                                </TouchableOpacity>
                                                <Text style={styles.counterValue}>{formData.brothers}</Text>
                                                <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('brothers', (parseInt(formData.brothers || 0) + 1).toString())}>
                                                    <Icon name="plus" size={16} color="#EC4899" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View style={styles.sibDivider} />
                                        <View style={styles.sibItem}>
                                            <Text style={styles.sibLabel}>அக்கா/தங்கை</Text>
                                            <View style={styles.counterRow}>
                                                <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('sisters', Math.max(0, parseInt(formData.sisters || 0) - 1).toString())}>
                                                    <Icon name="minus" size={16} color="#EC4899" />
                                                </TouchableOpacity>
                                                <Text style={styles.counterValue}>{formData.sisters}</Text>
                                                <TouchableOpacity style={styles.counterBtn} onPress={() => updateField('sisters', (parseInt(formData.sisters || 0) + 1).toString())}>
                                                    <Icon name="plus" size={16} color="#EC4899" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                <ModernInput label="எதிர்பார்ப்புகள்" value={formData.expectations} onChangeText={(t) => updateField('expectations', t)} placeholder="வரண் எதிர்பார்ப்புகள்" multiline icon="heart-outline" />
                                <ModernInput label="மின்னஞ்சல்" value={formData.email} onChangeText={(t) => updateField('email', t)} placeholder="email@example.com" keyboardType="email-address" icon="email" />
                            </>
                        ) : (
                            <View style={styles.otpSection}>
                                <View style={styles.otpIconContainer}>
                                    <Icon name="shield-check" size={64} color="#EC4899" />
                                </View>
                                <Text style={styles.otpTitleModern}>OTP உறுதிப்படுத்தல்</Text>
                                <Text style={styles.otpSubtitle}>உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்</Text>
                                <View style={styles.otpRowModern}>
                                    {[0, 1, 2, 3].map((i) => (
                                        <TextInput
                                            key={i}
                                            ref={r => otpInputs.current[i] = r}
                                            style={styles.otpBoxModern}
                                            maxLength={1}
                                            keyboardType="number-pad"
                                            value={otp[i]}
                                            onChangeText={(t) => handleOtpChange(i, t)}
                                        />
                                    ))}
                                </View>
                                <TouchableOpacity style={styles.resendButton}>
                                    <Text style={styles.resendText}>குறியீட்டை மீண்டும் அனுப்பு</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {currentStep === 3 && (
                    <View style={styles.formSection}>
                        <View style={styles.passwordHeader}>
                            <View style={styles.passwordIconContainer}>
                                <Icon name="lock-plus" size={48} color="#EC4899" />
                            </View>
                            <Text style={styles.sectionTitle}>கடவுச்சொல் அமைக்கவும்</Text>
                            <Text style={styles.sectionSubtitle}>உங்கள் கணக்கிற்கு பாதுகாப்பான கடவுச்சொல்லை உருவாக்கவும்</Text>
                        </View>

                        <View style={styles.passwordContainer}>
                            <ModernInput
                                label="கடவுச்சொல்"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="புதிய கடவுச்சொல்"
                                icon="lock"
                                secureTextEntry={!showPassword}
                                rightIcon={showPassword ? "eye-off" : "eye"}
                                onRightIconPress={() => setShowPassword(!showPassword)}
                            />

                            <ModernInput
                                label="கடவுச்சொல்லை உறுதி செய்"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="மீண்டும் கடவுச்சொல்"
                                icon="lock-check"
                                secureTextEntry={!showConfirmPassword}
                                rightIcon={showConfirmPassword ? "eye-off" : "eye"}
                                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            />

                            <View style={styles.passwordHints}>
                                <View style={styles.hintItem}>
                                    <Icon name="check-circle" size={16} color="#10B981" />
                                    <Text style={styles.hintText}>குறைந்தது 8 எழுத்துகள்</Text>
                                </View>
                                <View style={styles.hintItem}>
                                    <Icon name="check-circle" size={16} color="#10B981" />
                                    <Text style={styles.hintText}>ஒரு பெரிய எழுத்து மற்றும் சிறிய எழுத்து</Text>
                                </View>
                                <View style={styles.hintItem}>
                                    <Icon name="check-circle" size={16} color="#10B981" />
                                    <Text style={styles.hintText}>ஒரு எண் அல்லது சிறப்பு எழுத்து</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Bottom Buttons */}
            <View style={[styles.sheetFooter, { paddingBottom: insets.bottom + 16 }]}>
                {currentStep > 1 && (
                    <TouchableOpacity style={styles.backBtnSheet} onPress={handleBack}>
                        <Icon name="arrow-left" size={20} color="#6B7280" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.nextBtnSheet} onPress={handleNext}>
                    <LinearGradient colors={['#EC4899', '#BE185D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.nextGradientSheet}>
                        <Text style={styles.nextTextSheet}>
                            {currentStep === 3 ? 'பதிவு செய்' : currentStep === 2 && showOtpInput ? 'சரிபார்' : 'தொடர்ந்து செல்'}
                        </Text>
                        <Icon name={currentStep === 3 ? "check-circle" : showOtpInput ? "shield-check" : "arrow-right"} size={20} color="#FFF" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );

    // Success Screen
    const renderSuccess = () => (
        <View style={styles.successContainerModern}>
            <Animated.View style={[styles.successCardModern, { opacity: fadeAnim }]}>
                <View style={styles.successIconModern}>
                    <Icon name="check-circle" size={80} color="#10B981" />
                </View>
                <Text style={styles.successTitleModern}>பதிவு முடிந்தது!</Text>
                <Text style={styles.successDescModern}>
                    உங்கள் விவரங்கள் சேமிக்கப்பட்டன. நிர்வாகி சரிபார்த்த பிறகு {'\n'}உங்களுக்கு தகவல் அனுப்பப்படும்.
                </Text>

                <View style={styles.summaryBoxModern}>
                    <View style={styles.summaryItemModern}>
                        <Icon name="account" size={20} color="#EC4899" />
                        <Text style={styles.summaryTextModern}>{formData.name}</Text>
                    </View>
                    <View style={styles.summaryItemModern}>
                        <Icon name="phone" size={20} color="#EC4899" />
                        <Text style={styles.summaryTextModern}>{formData.phone1}</Text>
                    </View>
                    <View style={styles.summaryItemModern}>
                        <Icon name="email" size={20} color="#EC4899" />
                        <Text style={styles.summaryTextModern}>{formData.email}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.doneBtnModern} onPress={handleSubmit}>
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.doneGradientModern}>
                        <Text style={styles.doneTextModern}>முடிக்க</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );

    return (
        <View style={styles.containerModern}>
            <LinearGradient colors={['#EC4899', '#BE185D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.headerModern, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBackModern}>
                    <Icon name={currentStep === 0 ? "close" : "arrow-left"} size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitleModern}>Registration</Text>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {currentStep === 0 && renderTerms()}
            {(currentStep === 1 || currentStep === 2 || currentStep === 3) && renderFormSheet()}
            {currentStep === 4 && renderSuccess()}
        </View>
    );
};

const styles = StyleSheet.create({
    containerModern: {
        flex: 1,
        backgroundColor: '#F0F9FF',
    },
    headerModern: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerBackModern: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleModern: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFF',
    },

    // Terms Screen
    termsContainer: {
        flex: 1,
    },
    termsHeaderModern: {
        paddingVertical: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    termsTitleModern: {
        fontSize: 25,
        fontWeight: '800',
        color: '#2e2626ff',
        textAlign: 'center',
    },

    termsContent: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    termsCardModern: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    termItemModern: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    termBulletModern: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    termNumberModern: {
        color: '#EC4899',
        fontSize: 12,
        fontWeight: '800',
    },
    termTextModern: {
        flex: 1,
        fontSize: 15,
        color: '#4B5563',
        lineHeight: 22,
    },
    termsButtonContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    rejectBtnModern: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    rejectTextModern: {
        color: '#6B7280',
        fontSize: 16,
        fontWeight: '700',
    },
    acceptBtnModern: {
        flex: 2,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    acceptGradientModern: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    acceptTextModern: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },

    // Bottom Sheet
    bottomSheet: {
        flex: 1,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        marginTop: -20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
    },
    sheetHeader: {
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 16,
    },

    // Step Indicator
    stepIndicatorContainer: {
        width: '100%',
        paddingHorizontal: 40,
    },
    stepIndicatorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    stepCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepCircleActive: {
        backgroundColor: '#EC4899',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9CA3AF',
    },
    stepNumberActive: {
        color: '#FFF',
    },
    stepConnector: {
        flex: 1,
        height: 2,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 8,
    },
    stepConnectorActive: {
        backgroundColor: '#EC4899',
    },
    stepLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    stepLabel: {
        fontSize: 12,
        color: '#9CA3AF',
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    stepLabelActive: {
        color: '#EC4899',
    },

    sheetContent: {
        padding: 20,
        paddingTop: 8,
    },

    // Form Sections
    formSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 4,
        textAlign: 'center',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 24,
        textAlign: 'center',
    },

    // Modern Form Inputs
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 4,
    },
    formCol: {
        flex: 1,
    },
    inputContainerModern: {
        marginBottom: 16,
    },
    inputLabelModern: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputWrapperModern: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 56,
    },
    textAreaWrapperModern: {
        height: 100,
        alignItems: 'flex-start',
        paddingTop: 8,
    },
    inputIconModern: {
        marginRight: 12,
    },
    textInputModern: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '500',
    },
    textAreaModern: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 8,
    },
    inputWithRightIcon: {
        paddingRight: 40,
    },
    rightIconContainer: {
        position: 'absolute',
        right: 16,
        height: 56,
        justifyContent: 'center',
    },
    selectWrapperModern: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        paddingHorizontal: 16,
        height: 56,
    },
    pickerModern: {
        flex: 1,
        height: 56,
        color: '#1F2937',
    },

    // Height Input
    heightContainerModern: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        height: 56,
        paddingHorizontal: 12,
    },
    heightInputModern: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    heightSlash: {
        color: '#D1D5DB',
        fontSize: 20,
        fontWeight: '300',
        marginHorizontal: 8,
    },

    // Siblings
    siblingsSheetCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
    },
    siblingsTitleSheet: {
        fontSize: 15,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 16,
    },
    siblingCounters: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    sibItem: {
        alignItems: 'center',
    },
    sibLabel: {
        fontSize: 13,
        color: '#6B7280',
        marginBottom: 12,
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        minWidth: 30,
        textAlign: 'center',
    },
    sibDivider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },

    // OTP Section
    otpSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    otpIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    otpTitleModern: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 32,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    otpRowModern: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    otpBoxModern: {
        width: 64,
        height: 68,
        borderRadius: 16,
        backgroundColor: '#F9FAFB',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    resendButton: {
        marginTop: 8,
    },
    resendText: {
        color: '#EC4899',
        fontSize: 14,
        fontWeight: '600',
    },

    // Password Section
    passwordHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    passwordIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#EDE9FE',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    passwordContainer: {
        gap: 8,
    },
    passwordHints: {
        backgroundColor: '#F0FDF4',
        borderRadius: 16,
        padding: 16,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#BBF7D0',
    },
    hintItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    hintText: {
        fontSize: 13,
        color: '#166534',
        fontWeight: '500',
    },

    // Footer
    sheetFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    backBtnSheet: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBtnSheet: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#EC4899',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    nextGradientSheet: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        gap: 8,
    },
    nextTextSheet: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '700',
    },

    // Success Screen
    successContainerModern: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    successCardModern: {
        backgroundColor: '#FFF',
        borderRadius: 32,
        padding: 40,
        alignItems: 'center',
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    successIconModern: {
        marginBottom: 24,
    },
    successTitleModern: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1F2937',
        marginBottom: 12,
    },
    successDescModern: {
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
    },
    summaryBoxModern: {
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 20,
        width: '100%',
        marginBottom: 24,
        gap: 12,
    },
    summaryItemModern: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryTextModern: {
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    doneBtnModern: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    doneGradientModern: {
        paddingVertical: 18,
        alignItems: 'center',
    },
    doneTextModern: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '700',
    },
    marriedCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    marriedTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        color: '#1F2937',
    },
    childRow: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    childTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },

});

export default RegistrationScreen;