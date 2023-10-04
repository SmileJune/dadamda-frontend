import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import { GOOGLE_ANALYTICS_TRACKING_ID } from "@/secret";

/**
 * uri 변경 추적 컴포넌트
 * uri가 변경될 때마다 pageview 이벤트 전송
 */
function RouteChangeTracker() {
  const location = useLocation();
  const [initialized, setInitialized] = useState(false);

  // 구글 애널리틱스 운영서버만 적용
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      ReactGA.initialize(GOOGLE_ANALYTICS_TRACKING_ID);
      setInitialized(true);
    }
  }, []);

  // location 변경 감지시 pageview 이벤트 전송
  useEffect(() => {
    if (initialized) {
      ReactGA.set({ page: location.pathname });
      ReactGA.send("pageview");
    }
  }, [initialized, location]);

  return null;
}

export default RouteChangeTracker;
