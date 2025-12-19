import React, { useEffect, useState } from "react";
import {
  Route,
  Routes,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Redirect component for old sports game URLs
const SportsGameRedirect = () => {
  const { eventId } = useParams();
  return <Navigate to={`/market/sports?eventId=${eventId}`} replace />;
};

// Component for new game view route that preserves the URL format
const SportsGameViewRoute = () => {
  const { id } = useParams();
  return <Sports initialEventId={id} />;
};
import { useSelector, useDispatch } from "react-redux";
import Home from "./pages/Home";
import Market from "./pages/Market";
import Sports from "./pages/Sports";
import MarketHome from "./pages/MarketHome";
import MarketSearch from "./pages/MarketSearch";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Watchlist from "./pages/Watchlist";
import Activity from "./pages/Activity"; // Import the traditional Activity component
import PaymentSuccess from "./pages/PaymentSuccess"; // Import payment success page
import PaymentCancel from "./pages/PaymentCancel"; // Import payment cancel page
import Documentation from "./pages/Documentation"; // Import documentation page
import ProtectedRoute from "./components/ProtectedRoute";
import LoginDialog from "./components/auth/LoginDialog";
import BottomNavBar from "./components/BottomNavBar";
import SharedLayout from "./components/SharedLayout"; // Import the new SharedLayout component
import ActivityContent from "./components/content/ActivityContent"; // Import activity content
import ThoughtsContent from "./components/content/ThoughtsContent"; // Import thoughts content
import ThoughtDetailContent from "./components/content/ThoughtDetailContent"; // Import thought detail content
import NewThoughtDetail from "./pages/NewThoughtDetail"; // Import new thought detail page
import CommentaryContent from "./components/content/CommentaryContent";
import MarketIdeasContent from "./components/content/MarketIdeasContent"; // Import market ideas content
import { setShowLoginDialog } from "./store/reducers/uiSlice";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import Navbar from "./components/Navbar"; // Import Navbar to use globally
import Election from "./pages/Election";
import BreakingNews from "./pages/BreakingNews";
import Macro from "./pages/Macro";
import FedRates from "./pages/FedRates";
import SportsLive from "./pages/SportsLive";
import RegisterDialog from "./components/auth/RegisterDialog";
import useMarketingDialogs from "./hooks/useMarketingDialogs";
import FreeCreditsMarketingDialog from "./components/marketing/FreeCreditsMarketingDialog";
import { userDataAPI } from "./store/reducers/movieSlice";
import Lenis from "@studio-freight/lenis";
import HomeSidebar from "./components/HomeSidebar";
import EventsForm from "./pages/EventsForm";
import NewEventComponent from "./pages/EventsForm";
import CreateEvent from "./pages/CreateEvent";

function App() {
  const theme = useSelector((state) => state.theme.value);
  const showLoginDialog = useSelector((state) => state.ui.showLoginDialog);
  const { isLogin, userData } = useSelector((state) => state.user);
  const [sidebar, setSidebar] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    document.body.className = theme;
  }, [theme, location.pathname]);

  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const {
    showFreeCreditsDialog,
    handleCloseFreeCreditsDialog,
    handleRegisterClick,
  } = useMarketingDialogs(() => {
    setShowRegisterDialog(true);
  });
  const handleCloseLoginDialog = () => {
    dispatch(setShowLoginDialog(false));
  };
  useEffect(() => {
    if (isLogin) {
      dispatch(userDataAPI());
    }
  }, [isLogin]);
  const handleCloseRegisterDialog = () => {
    setShowRegisterDialog(false);
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0, // faster
      smooth: true,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handlesidebar = () => {
    setSidebar(!sidebar);
  };

  const [addBookmark, setAddBookMark] = useState(false);
  const [addPosition, setAddPositon] = useState(false);

  return (
    <HelmetProvider>
      <ToastProvider>
        <div className="">
          <Navbar />

          <div className="w-full h-auto flex justify-start items-center gap-1">
            {/* {location.pathname !== "/thoughts" &&
              location.pathname !== "/thoughts/latest" &&
              location.pathname !== "/thoughts/market-ideas" && 
              location.pathname !== "/activity" &&
               (
                <HomeSidebar
                  addPosition={addPosition}
                  addBookmark={addBookmark}
                  setAddBookMark={setAddBookMark}
                  handlesidebar={handlesidebar}
                  sidebar={sidebar}
                />
              )} */}

              {
                isLogin && 

                 <HomeSidebar
                  addPosition={addPosition}
                  addBookmark={addBookmark}
                  setAddBookMark={setAddBookMark}
                  handlesidebar={handlesidebar}
                  sidebar={sidebar}
                />

              }

            
            <div
              className={`  w-full h-auto flex justify-center items-center 
              ${sidebar ? `pl-0 ${isLogin && "xl:pl-[300px] "} `: "pl-[50px]"}
              transition-all duration-300`}>
              <Routes>
                {/* Standard routes */}
                <Route
                  path="/"
                  element={
                    <Home
                      addPosition={addPosition}
                      setAddPositon={setAddPositon}
                      addBookmark={addBookmark}
                      setAddBookMark={setAddBookMark}
                    />
                  }
                />
                <Route path="/market" element={<MarketHome />} />
                <Route path="/market/:category" element={<MarketHome />} />
                <Route path="/market/search" element={<MarketSearch />} />
                <Route path="/search" element={<Search />} />
                <Route path="/market/sports" element={<Sports />} />
                <Route path="/market/" element={<Election />}>
                  <Route path="elections" element={<BreakingNews />} />
                  <Route path="macro" element={<Macro />} />
                  <Route path="sports-live" element={<SportsLive />} />
                  <Route path="fed-rates" element={<FedRates />} />
                </Route>

                <Route
                  path="/market/sports/game/:id"
                  element={<SportsGameViewRoute />}
                />
                <Route
                  path="/market/details/:id"
                  element={
                    <Market
                      addPosition={addPosition}
                      setAddPositon={setAddPositon}
                      sidebar={sidebar}
                    />
                  }
                />

                {/* Redirect old sports game URLs to new component-based navigation */}
                <Route
                  path="/sports/game/:eventId"
                  element={<SportsGameRedirect />}
                />

                {/* Payment routes */}
                <Route path="/success" element={<PaymentSuccess />} />
                <Route path="/cancel" element={<PaymentCancel />} />

                {/* Documentation route */}
                <Route path="/docs" element={<Documentation />} />

                {/* New Thought Detail Page (standalone) */}
                <Route path="/thought/new/:id" element={<NewThoughtDetail />} />

                {/* Routes that use the SharedLayout */}
                <Route path="/" element={<SharedLayout />}>
                  <Route path="activity" element={<ActivityContent />} />
                  <Route path="thoughts" element={<ThoughtsContent />} />
                  <Route
                    path="thoughts/latest"
                    element={<CommentaryContent />}
                  />
                  <Route
                    path="thoughts/market-ideas"
                    element={<MarketIdeasContent />}
                  />
                  <Route
                    path="thought/detail/:id"
                    element={<ThoughtDetailContent />}
                  />
                </Route>

                {/* Legacy Activity route - can be removed once the new layout is confirmed working */}
                <Route path="/activity-old" element={<Activity />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <CreateEvent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookmarks"
                  element={
                    <ProtectedRoute>
                      <Watchlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/edit"
                  element={
                    <ProtectedRoute>
                      <EditProfile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/:category" element={<MarketHome />} />
              </Routes>
            </div>
          </div>

          <LoginDialog
            open={showLoginDialog}
            onClose={handleCloseLoginDialog}
            onShowRegister={() => {
              handleCloseLoginDialog();
              setShowRegisterDialog(true);
            }}
          />
          <RegisterDialog
            open={showRegisterDialog}
            onClose={handleCloseRegisterDialog}
            onShowLogin={() => {
              handleCloseRegisterDialog();
              dispatch(setShowLoginDialog(true));
            }}
          />
          {/* <FreeCreditsMarketingDialog
            open={showFreeCreditsDialog}
            onClose={handleCloseFreeCreditsDialog}
            onRegisterClick={handleRegisterClick}
          /> */}
          <BottomNavBar />
          <ToastContainer />
        </div>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
