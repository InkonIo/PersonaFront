import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import {textStyles} from "@/constants/textStyles";
import Colors from "@/constants/Colors";
import {useTranslation} from 'react-i18next';


const AboutApp = () => {
    const {t} = useTranslation();

    return (
        <ScrollView contentContainerStyle={{padding: 16}}>
            <View style={{marginTop: 20, marginBottom: 20}}>
                <Text style={[textStyles.body20Medium, {textAlign: "center"}]}>
                    {t('about.welcome')}
                </Text>
                <Text style={[textStyles.body20Medium, {marginTop: 20, color: Colors.greenSecond}]}>
                    {t('about.tagline')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p1')}{' '}
                    <Text style={{fontFamily: 'futuraPTBold', fontWeight: 'bold'}}>
                        {t('about.p1_bold')}
                    </Text>
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p2')}
                </Text>

                <Text style={[textStyles.body20Medium, {textAlign: "center", marginTop: 20}]}>
                    {t('about.projectTitle')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p3')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p3_goal')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p3_responsibility')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p3_levels')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p4')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p5')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p6')}
                </Text>

                <View style={styles.table}>
                    <View style={styles.row}>
                        <Text style={[styles.cell, styles.header]}>{t('about.table.status')}</Text>
                        <Text style={[styles.cell, styles.header]}>{t('about.table.fee')}</Text>
                        <Text style={[styles.cell, styles.header]}>{t('about.table.ratings')}</Text>
                        <Text style={[styles.cell, styles.header]}>{t('about.table.rating')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{t('about.table.beginner')}</Text>
                        <Text style={styles.cell}>{t('about.table.beginnerFee')}</Text>
                        <Text style={styles.cell}>{t('about.table.beginnerRatings')}</Text>
                        <Text style={styles.cell}>{t('about.table.beginnerRating')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{t('about.table.amateur')}</Text>
                        <Text style={styles.cell}>{t('about.table.amateurFee')}</Text>
                        <Text style={styles.cell}>{t('about.table.amateurRatings')}</Text>
                        <Text style={styles.cell}>{t('about.table.amateurRating')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{t('about.table.master')}</Text>
                        <Text style={styles.cell}>{t('about.table.masterFee')}</Text>
                        <Text style={styles.cell}>{t('about.table.masterRatings')}</Text>
                        <Text style={styles.cell}>{t('about.table.masterRating')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{t('about.table.pro')}</Text>
                        <Text style={styles.cell}>{t('about.table.proFee')}</Text>
                        <Text style={styles.cell}>{t('about.table.proRatings')}</Text>
                        <Text style={styles.cell}>{t('about.table.proRating')}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.cell}>{t('about.table.patron')}</Text>
                        <Text style={styles.cell}>{t('about.table.patronFee')}</Text>
                        <Text style={styles.cell}>{t('about.table.patronRatings')}</Text>
                        <Text style={styles.cell}>{t('about.table.patronRating')}</Text>
                    </View>
                </View>

                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.incomeTitle')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph, {marginTop: 10, fontStyle: 'italic'}]}>
                    {t('about.incomeNote')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.ambassadorRating')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p7')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraph]}>
                    {t('about.p7_chat')}
                </Text>

                <Text style={[textStyles.body20Medium, {textAlign: "center", marginTop: 20}]}>
                    {t('about.audienceTitle')}
                </Text>
                <Text style={[textStyles.body16Light, styles.paragraphNoColor]}>
                    {t('about.p8')}{' '}
                    <Text style={{fontFamily: 'futuraPTBold', fontWeight: 'bold'}}>
                        {t('about.p8_bold')}
                    </Text>
                </Text>
                <Text style={[textStyles.body20Medium, {marginTop: 20, textAlign: 'center', color: Colors.greenSecond}]}>
                    {t('about.p8_slogan')}
                </Text>
                <Text style={[textStyles.body16Light, {marginTop: 20, lineHeight: 25, textAlign: 'center', color: Colors.greenSecond}]}>
                    {t('about.p8_cta')}
                </Text>

                {/* Logo section at the bottom */}
                <View style={styles.logoSection}>
                    <Image
                        source={require('@/assets/images/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.logoText}>Мобильное приложение Persona 1.0</Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    paragraph: {
        marginTop: 20,
        color: Colors.greenSecond,
        lineHeight: 25,
        textAlign: 'justify',
    },
    paragraphNoColor: {
        marginTop: 20,
        lineHeight: 25,
        textAlign: 'justify',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    row: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    cell: {
        flex: 1,
        padding: 10,
        textAlign: 'center',
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    header: {
        fontWeight: 'bold',
        backgroundColor: '#f1f1f1',
    },
    logoSection: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
        gap: 16,
    },
    logo: {
        width: 128,
        height: 128,
    },
    logoText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#50C878',
        textAlign: 'center',
    },
});

export default AboutApp;