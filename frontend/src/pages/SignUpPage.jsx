import React, { useState, useEffect } from 'react'
import { Earth, ShipWheelIcon } from "lucide-react";
import { Link } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {axiosInstance} from '../lib/axios';
import { signup } from '../lib/api';


const SignUpPage = () => {

  //signup data state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  // This is how we did it at first, without using our custom hook
  const queryClient = useQueryClient();

  const {
    mutate:signupMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
  });
  

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  }

  console.log(signupData);

  //to manage image
  const images = [
    '/Video call-bro.png',
    '/Video call-cuate.png',
    '/Video call-pana.png',
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 5 seconds

    return () => clearInterval(interval); // Cleanup
  }, []);

  const currentImage = images[currentImageIndex];




  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <Earth className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
              BHASHA
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span>
            </div>
          )}

          {/* SIGNUP FORM */}
          <div className='w-full'>
            <form onSubmit={handleSignup}>
              <div className='space-y-4'>
                <div>
                  <h2 className="text-xl font-semibold">Create an Account</h2>
                  <p className="text-sm opacity-70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>

                <div className='space-y-3'>
                  {/* FULLNAME */}
                  <div className='form-control w-full'>
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className='form-control w-full'>
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="johnDoe@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className='form-control w-full'>
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>
                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Loading...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>


              </div>
            </form>
          </div>
        </div>
        {/* SIGNUP IMAGE - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Carousel */}
            <div className="relative aspect-square max-w-sm mx-auto transition-all duration-500">
              <img src={currentImage} alt="Language connection illustration" className="w-full h-full object-contain" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default SignUpPage