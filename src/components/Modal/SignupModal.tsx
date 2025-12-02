import React, { useState } from "react";
import { useNavigate  } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import * as Yup from "yup";

// Yup validation schema
const signupSchema = Yup.object().shape({
  fullName: Yup.string().min(3, "Full name must be at least 3 characters").required("Full name is required"),
  mobile: Yup.string().matches(/^\d{10}$/, "Mobile number must be exactly 10 digits").required("Mobile number is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(8, "Password must be at least 8 characters").max(72, "Password cannot exceed 72 characters").required("Password is required"),
});

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState<"form" | "otp">("form"); // control step
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = async () => {
    try {
      await signupSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationError: any) {
      const newErrors: { [key: string]: string } = {};
      validationError.inner.forEach((err: any) => {
        if (err.path) newErrors[err.path] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  // Step 1 → Register & request OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateForm();
    if (isValid) {
      console.log("Form submitted ✅", formData);
      try {
        // Call backend to send OTP
        // const res = await fetch("http://127.0.0.1:8000/auth/send-otp", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ mobile: formData.mobile }),
        // });
        // if (!res.ok) throw new Error("Failed to send OTP");
        setStep("otp"); // switch to OTP step
      } catch (err) {
        console.error(err);
        alert("Error sending OTP");
      }
    }
  };

  // Step 2 → Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    try {
    //   const res = await fetch("http://127.0.0.1:8000/auth/verify-otp", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ mobile: formData.mobile, otp }),
    //   });
    //   if (!res.ok) throw new Error("Invalid OTP");
    //   const data = await res.json();
    //   console.log("Registration successful", data);
      navigate("/SignUpStepsOne"); 
      alert("Registration successful!");
      onClose();
    } catch (err) {
      setOtpError("Invalid OTP, please try again");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-80">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 relative">
        <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-800" onClick={onClose}>
          ✕
        </button>

        {step === "form" ? (
          <>
            <h2 className="text-2xl font-bold mb-1 text-center">Sign up</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Learn on your own time from top universities and businesses.</p>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${errors.fullName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="text-sm font-medium text-gray-700">Mobile <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter your mobile number"
                  maxLength={10}
                  className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${errors.mobile ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.mobile && <p className="text-xs text-red-500 mt-1">{errors.mobile}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@email.com"
                  className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className={`w-full border rounded px-3 py-2 mt-1 focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
                />
                <p className="text-xs text-gray-400 mt-1">Between 8 and 72 characters</p>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700">Send OTP</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Verify OTP</h2>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={6}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {otpError && <p className="text-xs text-red-500">{otpError}</p>}
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:hover:bg-blue-700">Verify & Register</button>
            </form>
          </>
        )}

        {step === "form" && (
          <>
            <div className="my-4 text-center text-sm text-gray-400">or</div>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center border rounded py-2 hover:bg-gray-50">
                <FontAwesomeIcon icon={faGoogle} className="w-5 mr-2 text-red-500" />
                Continue with Google
              </button>
              <button className="w-full flex items-center justify-center border rounded py-2 hover:bg-gray-50">
                <FontAwesomeIcon icon={faLinkedin} className="w-5 mr-2 text-blue-600" />
                Continue with LinkedIn
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupModal;
