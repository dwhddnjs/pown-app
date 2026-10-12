import React from "react";
// component
import { UpdateDialog } from "@/components/update-dialog";

// 앱 루트에 한 번 붙는 iOS 전용 요소 — App Store 새 버전 안내
export const PlatformRoot = () => <UpdateDialog />;
