import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import PasswordInput from "../../components/Input/PasswordInput";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";

const SignUp = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validateForm = () => {
    if (!form.name) {
      setError("Please Enter your Name.");
      return false;
    }
    if (!validateEmail(form.email)) {
      setError("Please Enter a Valid Email");
      return false;
    }
    if (!form.password) {
      setError("Please Enter a Password");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't Match");
      return false;
    }
    return true;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    try {
      const response = await axiosInstance.post("/create_account", {
        fullName: form.name,
        email: form.email,
        password: form.password,
      });

      if (response.data && response.data.error) {
        setError(response.data.message);
      } else if (response.data && response.data.accessToken) {
        localStorage.setItem("token", response.data.accessToken);
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "An Unexpected Error Occurred. Pleas Try Again."
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-10">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl mb-7">Sign Up</h4>

            <label htmlFor="name" className="sr-only">
              Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              className="input-box"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              id="email"
              type="text"
              placeholder="Email"
              className="input-box"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            <PasswordInput
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
            />

            <PasswordInput
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Sign Up
            </button>

            <p className="text-sm text-center mt-4">
              Already Have an Account?{" "}
              <Link to="/login" className="font-medium text-primary underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignUp;
