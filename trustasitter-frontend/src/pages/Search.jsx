// src/pages/Search.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";



const Search = () => {
  const [babysitters, setBabysitters] = useState([]);
  const [loading, setLoading] = useState(true);


  // Filter states
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Modal state
  const [modal, setModal] = useState({ message: "", type: "" });
  const [selectedSitter, setSelectedSitter] = useState(null);
  const [selectedCardSitter, setSelectedCardSitter] = useState(null); // 选中的卡片

  // 用户位置和地图中心
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: -36.8485, lng: 174.7633 }); // 默认奥克兰
  const [selectedLocation, setSelectedLocation] = useState(null); // 用户点击的位置

  // Debug: Log whenever userLocation changes
  useEffect(() => {
    console.log("📍 userLocation changed:", userLocation);
  }, [userLocation]);

  // 计算两点间距离的函数（Haversine公式）
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 处理地图点击
  const handleMapClick = (e) => {
    const clickedLat = e.latLng.lat();
    const clickedLng = e.latLng.lng();
    setSelectedLocation({ lat: clickedLat, lng: clickedLng });
    setMapCenter({ lat: clickedLat, lng: clickedLng });
  };

  // 处理 babysitter 卡片点击
  const handleSitterCardClick = (sitter) => {
    if (sitter.latitude && sitter.longitude) {
      setSelectedLocation({ lat: sitter.latitude, lng: sitter.longitude });
      setMapCenter({ lat: sitter.latitude, lng: sitter.longitude });
      setSelectedCardSitter(sitter.id); // 设置选中的卡片
    }
  };

  // 获取用户位置
  useEffect(() => {
    const getUserLocation = async () => {
      console.log("🔍 Starting getUserLocation...");
      
      // First, try to get user's saved location from profile
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        console.log("👤 User from localStorage:", user);
        
        if (user && user.id) {
          console.log("🔑 User is logged in, fetching profile...");
          const response = await api.get("/users/profile", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          
          console.log("📊 Profile response:", response.data);
          
          if (response.data.latitude && response.data.longitude) {
            const userLat = parseFloat(response.data.latitude);
            const userLng = parseFloat(response.data.longitude);
            setUserLocation({ lat: userLat, lng: userLng });
            setMapCenter({ lat: userLat, lng: userLng });
            console.log("✅ User location from profile:", { lat: userLat, lng: userLng });
            return;
          } else {
            console.log("❌ No coordinates in profile - using geolocation fallback");
          }
        } else {
          console.log("❌ No user found in localStorage");
        }
      } catch (error) {
        console.log("❌ Could not get user profile location:", error);
      }

      // Fallback to geolocation if no saved location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            setUserLocation({ lat: userLat, lng: userLng });
            setMapCenter({ lat: userLat, lng: userLng });
            console.log("User location from geolocation:", { lat: userLat, lng: userLng });
          },
          (error) => {
            console.log("Location access denied or failed:", error);
            // Fallback to a default location if geolocation fails
            setUserLocation({ lat: -36.8485, lng: 174.7633 });
            setMapCenter({ lat: -36.8485, lng: 174.7633 });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      } else {
        console.log("Geolocation not supported");
        // Fallback to a default location
        setUserLocation({ lat: -36.8485, lng: 174.7633 });
        setMapCenter({ lat: -36.8485, lng: 174.7633 });
      }
    };

    getUserLocation();
  }, []);

  // Fetch babysitters when component mounts
  useEffect(() => {
    const fetchBabysitters = async () => {
      try {
        const response = await api.get("/babysitters");
        setBabysitters(response.data);
      } catch (error) {
        console.error("Error fetching babysitters:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBabysitters();
  }, []);

  // Handle availability change
  const handleAvailabilityChange = (e) => {
    setSelectedAvailability(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Filtered babysitters based on selected filters
  const filteredBabysitters = babysitters.filter((sitter) => {
    let availabilityMatch = true;
    if (selectedAvailability && sitter.available_from && sitter.available_to) {
      const startHour = parseInt(sitter.available_from.split(":")[0]);
      if (selectedAvailability === "morning") {
        availabilityMatch = startHour <= 12;
      } else if (selectedAvailability === "afternoon") {
        availabilityMatch = startHour >= 12 && startHour < 18;
      } else if (selectedAvailability === "evening") {
        availabilityMatch = startHour >= 18;
      }
    }

    const dateMatch = selectedDate
      ? sitter.available_days &&
        sitter.available_days.includes(
          new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" })
        )
      : true;

    return availabilityMatch && dateMatch;
  });

  // 添加距离信息并排序
  const babysittersWithDistance = filteredBabysitters.map(sitter => {
    // 使用用户点击的位置或用户当前位置来计算距离
    const referenceLocation = selectedLocation || userLocation;
    if (sitter.latitude && sitter.longitude && referenceLocation) {
      const distance = calculateDistance(
        referenceLocation.lat, 
        referenceLocation.lng, 
        sitter.latitude, 
        sitter.longitude
      );
      return { ...sitter, distance };
    }
    return { ...sitter, distance: null };
  }).sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0;
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });

  // 调试信息
  console.log('Total babysitters:', babysitters.length);
  console.log('Filtered babysitters:', filteredBabysitters.length);
  console.log('Babysitters with coordinates:', babysittersWithDistance.filter(s => s.latitude && s.longitude).length);
  console.log('User location:', userLocation);
  console.log('Selected location:', selectedLocation);
  
  const babysittersWithCoords = babysittersWithDistance.filter(s => s.latitude && s.longitude);
  console.log('Babysitters that will be rendered on map:', babysittersWithCoords.length);
  
  babysittersWithDistance.forEach(sitter => {
    if (sitter.latitude && sitter.longitude) {
      console.log(`${sitter.name}: ${sitter.latitude}, ${sitter.longitude}, Distance: ${sitter.distance}km`);
    } else {
      console.log(`${sitter.name}: No coordinates`);
    }
  });

  return (
    <main className="bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen py-12 px-6 relative">
      {/* Modal Overlay */}
      {modal.message && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl text-center">
            {modal.type === "login-required" ? (
              <>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  Login Required
                </h2>
                <p className="text-gray-600 mb-4">{modal.message}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setModal({ message: "", type: "" })}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => window.location.href = "/login"}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => window.location.href = "/choose-role"}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
                  >
                    Register
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  {modal.type === "success" ? "Success" : "Error"}
                </h2>
                <p className="text-gray-600 mb-4">{modal.message}</p>
                <button
                  onClick={() => setModal({ message: "", type: "" })}
                  className={`px-4 py-2 rounded ${
                    modal.type === "success"
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "bg-red-500 hover:bg-red-600"
                  } text-white transition`}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-center mb-8">
        <span className="text-blue-600">Find</span>{" "}
        <span className="text-purple-500">a Babysitter</span>
      </h1>



      {/* Location and Filters */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Your Location</h3>
              {userLocation ? (
                <p className="text-sm text-gray-600">
                  📍 Current location detected
                  {selectedLocation && (
                    <span className="ml-2 text-blue-600">
                      • Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-gray-500">📍 Getting your location...</p>
              )}
            </div>
            <button
              onClick={async (event) => {
                console.log("🔄 Update Location button clicked");
                
                // Add rotation animation
                const button = event.target;
                button.style.transform = 'rotate(360deg)';
                button.style.transition = 'transform 0.5s ease';
                
                try {
                  // First, try to get user's saved location from profile
                  const user = JSON.parse(localStorage.getItem("user"));
                  console.log("👤 User from localStorage (button):", user);
                  
                  if (user && user.id) {
                    console.log("🔑 User is logged in, fetching profile (button)...");
                    const response = await api.get("/users/profile", {
                      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                    });
                    
                    console.log("📊 Profile response (button):", response.data);
                    
                    if (response.data.latitude && response.data.longitude) {
                      const userLat = parseFloat(response.data.latitude);
                      const userLng = parseFloat(response.data.longitude);
                      setUserLocation({ lat: userLat, lng: userLng });
                      setMapCenter({ lat: userLat, lng: userLng });
                      setSelectedLocation(null); // Clear selected location
                      console.log("✅ Updated user location from profile:", { lat: userLat, lng: userLng });
                      
                      // Reset animation after completion
                      setTimeout(() => {
                        button.style.transform = 'rotate(0deg)';
                      }, 500);
                      return;
                    } else {
                      console.log("❌ No coordinates in profile (button)");
                    }
                  } else {
                    console.log("❌ No user found in localStorage (button)");
                  }
                } catch (error) {
                  console.log("❌ Could not get user profile location (button):", error);
                }

                // Fallback to geolocation
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const userLat = position.coords.latitude;
                      const userLng = position.coords.longitude;
                      setUserLocation({ lat: userLat, lng: userLng });
                      setMapCenter({ lat: userLat, lng: userLng });
                      setSelectedLocation(null); // Clear selected location
                      
                      // Reset animation after completion
                      setTimeout(() => {
                        button.style.transform = 'rotate(0deg)';
                      }, 500);
                    },
                    (error) => {
                      console.log("Location access denied or failed:", error);
                      // Reset animation even on error
                      setTimeout(() => {
                        button.style.transform = 'rotate(0deg)';
                      }, 500);
                    },
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 300000
                    }
                  );
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition flex items-center gap-2"
            >
              Update Location
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <input
          type="date"
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedDate}
          onChange={handleDateChange}
        />

        <select
          className="px-4 py-2 border rounded focus:outline-none"
          value={selectedAvailability}
          onChange={handleAvailabilityChange}
        >
          <option value="">Availability</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>

        <button
          className="bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          onClick={() => {
            setSelectedAvailability("");
            setSelectedDate("");
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Map Section - Always show */}
      <div className="max-w-4xl mx-auto mb-8">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "350px" }}
          center={mapCenter}
          zoom={userLocation ? 9 : 11}
          onClick={handleMapClick}
        >
            {userLocation && (
              <Marker
                key={`user-${userLocation.lat}-${userLocation.lng}`}
                position={userLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                  scaledSize: new google.maps.Size(30, 30),
                }}
              />
            )}
            {selectedLocation && (
              <Marker
                position={selectedLocation}
                icon={{
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new google.maps.Size(30, 30),
                }}
              />
            )}
            {!loading && babysittersWithDistance.map((sitter) => (
              sitter.latitude && sitter.longitude && (
                <Marker
                  key={sitter.id}
                  position={{ lat: sitter.latitude, lng: sitter.longitude }}
                  onClick={() => setSelectedSitter(sitter)}
                />
              )
            ))}
            {selectedSitter && (
              <InfoWindow
                position={{ lat: selectedSitter.latitude, lng: selectedSitter.longitude }}
                onCloseClick={() => setSelectedSitter(null)}
              >
                <div>
                  <strong>{selectedSitter.name}</strong><br />
                  {selectedSitter.address}<br />
                  {selectedSitter.distance !== null && (
                    <span style={{ color: '#3B82F6' }}>
                      {selectedSitter.distance.toFixed(1)} km away
                    </span>
                  )}
                </div>
              </InfoWindow>
                          )}
            </GoogleMap>
            {loading && (
              <div className="text-center text-gray-600 mt-2">
                Loading babysitters...
              </div>
            )}
          </div>

      {loading ? (
        <p className="text-center text-gray-600">Loading babysitters...</p>
      ) : filteredBabysitters.length === 0 ? (
        <p className="text-center text-gray-600">
          No babysitters match your criteria.
        </p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {babysittersWithDistance.map((sitter) => (
            <div
              key={sitter.id}
              className={`bg-white rounded shadow p-4 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow ${
                selectedCardSitter === sitter.id ? 'ring-2 ring-purple-500 bg-purple-50' : ''
              }`}
              onClick={() => handleSitterCardClick(sitter)}
            >
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {sitter.name}
                </h2>

                {sitter.distance !== null ? (
                  <p className="text-blue-600 mb-1">
                    <strong>📍 Distance:</strong> {sitter.distance.toFixed(1)} km away
                  </p>
                ) : (
                  <p className="text-gray-500 mb-1">
                    <strong>📍 Distance:</strong> Location not available
                  </p>
                )}
                <p className="text-gray-600 mb-1">
                  <strong>Rate:</strong>{" "}
                  {sitter.rate ? `$${sitter.rate}/hr` : "Not specified"}
                </p>
                <p className="text-gray-600 mb-1">
                  <strong>Available:</strong>{" "}
                  {sitter.available_days
                    ? sitter.available_days.join(", ")
                    : "Not specified"}
                </p>
                <p className="text-gray-600">
                  <strong>About:</strong>{" "}
                  {sitter.about || "No description provided."}
                </p>
              </div>
              <button
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发卡片的点击事件
                  const user = JSON.parse(localStorage.getItem("user"));
                  if (!user) {
                    setModal({
                      message: "To book a babysitter, please log in or create an account.",
                      type: "login-required",
                    });
                    return;
                  }

                  // If logged in, proceed to create booking
                  (async () => {
                    try {
                      const userId = user.id;

                      const bookingData = {
                        user_id: userId,
                        babysitter_id: sitter.id,
                        date: new Date().toISOString().split("T")[0],
                        time_start: "09:00",
                        time_end: "12:00",
                        status: "pending",
                      };

                      await api.post(
                        "/bookings",
                        bookingData
                      );

                      setModal({
                        message: "Booking created successfully!",
                        type: "success",
                      });
                    } catch (error) {
                      console.error("Error creating booking:", error);
                      setModal({
                        message: "Failed to create booking.",
                        type: "error",
                      });
                    }
                  })();
                }}
              >
                Request Booking
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Search;
