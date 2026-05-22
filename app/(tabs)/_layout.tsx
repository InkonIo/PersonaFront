import { Tabs } from "expo-router";
import { BellIcon, Icon } from "@gluestack-ui/themed";
import HomeIcon from "@/assets/icons/HomeIcon";
import Colors from "@/constants/Colors";
import UserIcon from "@/assets/icons/UserIcon";
import { textStyles } from "@/constants/textStyles";
import UserIconActive from "@/assets/icons/UserIconActive";
import { useAppSelector } from "@/store/hooks";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import ErrorModal from "@/components/ErrorModal";
import { ShieldIcon } from "lucide-react-native";

export default function Layout() {
  const { t } = useTranslation();

  const { userNotifications } = useAppSelector(
    (state) => state.notifications
  );

  const { userInfo } = useAppSelector((state) => state.user);

  const hasUnreadNotifications = userNotifications.some(
    (n) => n.isActive
  );

  const isAdmin = userInfo?.role === "ADMIN";

  const [isOfflineModal, setIsOfflineModal] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline =
        state.isConnected === false ||
        state.isInternetReachable === false;

      setIsOfflineModal(offline);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarActiveTintColor: Colors.black,
          tabBarInactiveTintColor: Colors.black,
          tabBarHideOnKeyboard: true,
          tabBarActiveBackgroundColor: Colors.greenFirst,

          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
          },

          tabBarLabelStyle: textStyles.body12Light,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color }) => (
              <Icon
                as={HomeIcon}
                color={color}
                size="md"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: t("tabs.notifications"),
            tabBarIcon: ({ color }) => (
              <View>
                <Icon
                  as={BellIcon}
                  color={color}
                  size="md"
                />

                {hasUnreadNotifications && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 1,
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      backgroundColor: "red",
                    }}
                  />
                )}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color, focused }) => (
              <Icon
                as={
                  focused
                    ? UserIconActive
                    : UserIcon
                }
                color={color}
                size="md"
              />
            ),
          }}
        />

        <Tabs.Screen
          name="admin"
          options={{
            title: "Админ",

            tabBarIcon: ({ color }) => (
              <ShieldIcon
                size={20}
                color={color}
              />
            ),

            href: isAdmin ? undefined : null,
          }}
        />
      </Tabs>

      <ErrorModal
        visible={isOfflineModal}
        message="Нет подключения к интернету. Проверьте Wi-Fi или мобильные данные."
        errorType="no_internet"
        onClose={() => setIsOfflineModal(false)}
      />
    </>
  );
}