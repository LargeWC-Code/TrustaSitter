import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { FaUserNurse } from "react-icons/fa";
import { GoogleMap, Marker } from "@react-google-maps/api";
import axios from "axios";
import AddressAutocomplete from "../components/AddressAutocomplete";



const GOOGLE_API_KEY = "AIzaSyBVW-pAsL7J590t7Y1uM8Y4tlcNvSdy0O4";

async function fetchAddressByLatLng(lat, lng) {
  console.log('Fetching address for:', lat, lng);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&components=country:NZ&key=${GOOGLE_API_KEY}`;
  try {
    const res = await axios.get(url);
    console.log('Geocoding response:', res.data);
    if (res.data.status === "OK") {
      return res.data.results[0]; // 最详细的地址
    } else {
      console.log('Geocoding failed with status:', res.data.status);
      return null;
    }
  } catch (error) {
    console.error('Geocoding request failed:', error);
    return null;
  }
}



const RegisterBabysitter = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    rate: "",
    availableDays: [],
    availableFrom: "",
    availableTo: "",
    about: "",
    profilePicture: null,
    certificates: [],
    latitude: null,
    longitude: null,
    address: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [marker, setMarker] = useState({ lat: -36.8485, lng: 174.7633 }); // Auckland 默认
  const [isGeocoding, setIsGeocoding] = useState(false);


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMarker({ lat, lng });
          let address = "";
          const addressResult = await fetchAddressByLatLng(lat, lng);
          if (addressResult) {
            address = addressResult.formatted_address;
          }
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, address }));
        },
        (error) => {
          // 定位失败，保持默认Auckland
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => {
        const updatedDays = checked
          ? [...prev.availableDays, value]
          : prev.availableDays.filter((day) => day !== value);
        return { ...prev, availableDays: updatedDays };
      });
    } else if (type === "file") {
      if (name === "certificates") {
        setFormData((prev) => ({ ...prev, certificates: files }));
      } else {
        setFormData((prev) => ({ ...prev, profilePicture: files[0] }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // If address is changed manually, geocode it with debounce
      if (name === 'address' && value.trim()) {
        clearTimeout(window.geocodeTimeout);
        window.geocodeTimeout = setTimeout(() => {
          geocodeAddress(value);
        }, 1000); // Wait 1 second after user stops typing
      }
    }
  };

  // Geocode address to get coordinates
  const geocodeAddress = async (address) => {
    setIsGeocoding(true);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&components=country:NZ&key=${GOOGLE_API_KEY}`;
    try {
      const res = await axios.get(url);
      if (res.data.status === "OK") {
        const location = res.data.results[0].geometry.location;
        const lat = location.lat;
        const lng = location.lng;
        setMarker({ lat, lng });
        setFormData((prev) => ({ 
          ...prev, 
          latitude: lat, 
          longitude: lng 
        }));
        console.log("Address geocoded successfully:", { lat, lng });
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = ({ lat, lng, address }) => {
    setMarker({ lat, lng });
    setFormData((prev) => ({ 
      ...prev, 
      latitude: lat, 
      longitude: lng,
      address 
    }));
    console.log("Address selected from autocomplete:", { lat, lng, address });
  };

  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker({ lat, lng });
    let address = "";
    const addressResult = await fetchAddressByLatLng(lat, lng);
    if (addressResult) {
      address = addressResult.formatted_address;
    }
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, address }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.availableFrom ||
      !formData.availableTo ||
      !formData.rate ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Create babysitter account
      await api.post("/babysitters/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        available_days: formData.availableDays,
        available_from: formData.availableFrom,
        available_to: formData.availableTo,
        about: formData.about,
        rate: formData.rate,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
      });

      // Login babysitter after registration
      const loginResponse = await api.post(
        "/babysitters/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // Save login in context (with role inside user)
      login({
        token: loginResponse.data.token,
        user: {
          ...loginResponse.data.user,
          role: "babysitter",
        },
        role: "babysitter",
      });


      navigate("/home-babysitter");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          "Failed to create account. Please try again."
      );
    }
  };

  return (
    <div className="flex items-start justify-center min-h-[80vh] bg-gradient-to-b from-purple-100 via-white to-purple-100 px-4 pt-20 pb-20">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
        <div className="flex flex-col items-center mb-6">
          <FaUserNurse className="text-purple-600 text-4xl mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Babysitter Registration</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Please fill out your information to create your profile.
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        {success && (
          <p className="text-green-600 text-center mb-4">{success}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            placeholder="Confirm Password"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="text"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />
          <AddressAutocomplete
            value={formData.address}
            onChange={(e) => {
              // Create a synthetic event with the correct name
              const syntheticEvent = {
                target: {
                  name: 'address',
                  value: e.target.value
                }
              };
              handleChange(syntheticEvent);
            }}
            onSelect={handleAddressSelect}
            placeholder="Enter your address"
            isGeocoding={isGeocoding}
            hasCoordinates={formData.latitude && formData.longitude}
          />

          {/* 地图选点功能 */}
          <div>
            <label className="block text-gray-700 mb-1">Select your location on the map:</label>
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "300px" }}
              center={marker}
              zoom={12}
              onClick={handleMapClick}
            >
              <Marker position={marker} />
            </GoogleMap>
            <div className="mt-2 text-sm text-gray-600">
              Latitude: {marker.lat.toFixed(6)}, Longitude: {marker.lng.toFixed(6)}
            </div>
          </div>
          <input
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            type="text"
            placeholder="Hourly Rate ($)"
            className="w-full px-4 py-2 border rounded focus:outline-none"
          />

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Available Days
            </label>
            <div className="grid grid-cols-2 gap-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                (day) => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={day}
                      checked={formData.availableDays.includes(day)}
                      onChange={handleChange}
                    />
                    <span>{day}</span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available From</label>
              <input
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-gray-700 font-medium">Available To</label>
              <input
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                type="time"
                className="w-full px-3 py-2 border rounded focus:outline-none"
              />
            </div>
          </div>

          <textarea
            name="about"
            value={formData.about}
            onChange={handleChange}
            placeholder="About Me"
            className="w-full px-4 py-2 border rounded focus:outline-none"
            rows="3"
          />

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Profile Picture
            </label>
            <input
              type="file"
              name="profilePicture"
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 text-gray-700 font-medium">
              Upload Certificates
            </label>
            <input
              type="file"
              name="certificates"
              onChange={handleChange}
              className="w-full"
              multiple
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterBabysitter;
