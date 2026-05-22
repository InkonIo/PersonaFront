import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useRouter } from "expo-router";
import { MMKV } from "react-native-mmkv";
import { useAppSelector } from "@/store/hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = new MMKV({
    id: "UserInactivity"
});
const LOCK_TIME = 1000;

export const UserInactivityProvider = ({ children }: any) => {
    const appState = useRef(AppState.currentState);
    const router = useRouter();

    const handleAppStateChange = (nextAppState: any) => {
        if (nextAppState === "inactive") {
            router.push("/(modals)/white");
        } else if (nextAppState === "background") {
            recordStartTime();
        } else if (nextAppState === "active" && appState.current.match(/background/)) {
            const elapsed = Date.now() - (storage.getNumber("startTime") || 0);
            if (elapsed >= LOCK_TIME) {
                router.push("/(modals)/lock");
            }
        }

        appState.current = nextAppState;
    };

    const recordStartTime = () => {
        storage.set("startTime", Date.now());
    };

    useEffect(() => {
        const subscription = AppState.addEventListener("change", handleAppStateChange);

        return () => {
            subscription.remove();
        };
    }, []);

    return children;
};
