import { useState, useEffect, useRef } from 'react';
import ResponseForm from './responseForm';
import { Link } from 'react-router-dom';
import { authFetch } from '../Utils/authFetch';


function RegisterForm({setShowRegister, setShowLogin, ResponseForm}) {
  const [responseObject, setResponseObject] = useState(null);

  useEffect(() => {
    const handleEscape = async (e) => {
      if (e.key === "Escape") {
        setShowRegister(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape)
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch(`${import.meta.env.VITE_API_URL}api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password'),
        password2: formData.get('password2')
      })
    });

    const data = await response.json()

    setResponseObject({status: response.status, data: data})

    // If registration was successfull, close register form and open login form
    if (response.status === 200 || response.status === 201) {
      setShowRegister(false);
      setShowLogin(true);
    }

  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative bg-neutral-950 p-8 rounded-lg">
          <button className="grid place-items-center bg-stone-900 hover:bg-stone-800 w-7 h-7 border rounded-xl border-stone-800 absolute top-2 right-2" onClick={() => setShowRegister(false)}>X</button>
          <form className='flex flex-col gap-5 items-center justify-center pt-3' onSubmit={handleSubmit}>
            <p className='text-3xl'>Register</p>
            <input className='border b-2 border-stone-800 rounded-lg p-2' name="username" placeholder="Username" />
            <input className='border b-2 border-stone-800 rounded-lg p-2' name="password" type="password" placeholder="Password" />
            <input className='border b-2 border-stone-800 rounded-lg p-2' name="password2" type="password" placeholder="Confirm Password" />
            <ResponseForm responseObject={responseObject}></ResponseForm>
            <button id='coolButton' type="submit">Register</button>
          </form>
        </div>
    </div>
  );
}


function LoginForm({setIsLoggedIn, setShowLogin, ResponseForm, showLogin}) {
  const [responseObject, setResponseObject] = useState(null);

  useEffect(() => {
    const handleEscape = async (e) => {
      if (e.key === "Escape") {
        setShowLogin(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const response = await fetch(`${import.meta.env.VITE_API_URL}api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        password: formData.get('password')
      })
    });

    const data = await response.json()

    setResponseObject({status: response.status, data: data})
    
    // Check if tokens were received successfully, if so, put them in localstorage and close the login form
    if (data.access && data.refresh) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      setIsLoggedIn(true);
      setShowLogin(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative bg-neutral-950 p-8 rounded-lg">
          <button className="grid place-items-center bg-stone-900 hover:bg-stone-800 w-7 h-7 border rounded-xl border-stone-800 absolute top-2 right-2" onClick={() => setShowLogin(false)}>X</button>
          <form className='flex flex-col gap-5 items-center justify-center pt-3' onSubmit={handleSubmit}>
            <p className='text-3xl'>Login</p>
            <input className='border b-2 border-stone-800 rounded-lg p-2' name="username" placeholder="Username" />
            <input className='border b-2 border-stone-800 rounded-lg p-2' name="password" type="password" placeholder="Password" />
            <ResponseForm responseObject={responseObject}></ResponseForm>
            <button id='coolButton' type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  )
}


function deleteCurrentUser(setRefreshTrigger, setIsLoggedIn) {
    authFetch(`${import.meta.env.VITE_API_URL}api/delete_account`, { 
    method: "DELETE", 
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem("access_token")}`
    },
    })
    .then(res => {
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
        setIsLoggedIn(false);
      }
    })
    .catch(() => {
      console.log("SOMEHOW DELETION FAILED")
    }) 
}


function DeleteUserForm({setIsLoggedIn, setShowDeleteUser, showDeleteUser, setRefreshTrigger}) {

  useEffect(() => {
    const handleEscape = async (e) => {
      if (e.key === "Escape") {
        setShowDeleteUser(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showDeleteUser]);

  return (
    <>
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='flex flex-col gap-5 bg-neutral-950 p-8 rounded-lg'>
          <p>Are you sure you want to delete your account?</p>
          <div className='flex flex-row gap-3 items-center justify-center'>
            <button id='coolButton' onClick={() => deleteCurrentUser(setRefreshTrigger, setIsLoggedIn)}>Yes</button>
            <button id='coolButton' onClick={() => setShowDeleteUser(false)}>No</button>
          </div>
        </div>
      </div>
    </>
  )
}




function LogoutConfirmForm({setShowLogoutConfirm, LogoutForm}) {
  return (
    <>
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='flex flex-col gap-5 bg-neutral-950 p-8 rounded-lg'>
          <p>Are you sure you want to logout?</p>
          <div className='flex flex-row gap-3 items-center justify-center'>
            <button id='coolButton' onClick={() => LogoutForm()}>Yes</button>
            <button id='coolButton' onClick={() => setShowLogoutConfirm(false)}>No</button>
          </div>
        </div>
      </div>
    </>
  )
}


export default function NavBar({currentUser, showLogin, setShowLogin, isLoggedIn, setIsLoggedIn}) {
    const [showRegister, setShowRegister] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showDeleteUser, setShowDeleteUser] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const dropdownRef = useRef(null);


    useEffect(() => {
      if (isLoggedIn) {
        const handleClick = async (e) => {
          if (!dropdownRef.current.contains(e.target)) {
            if (!showDeleteUser && !showLogoutConfirm) {
              setShowUserDropdown(false)
            }
          }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
      }
    }, [showDeleteUser, showLogoutConfirm])


    useEffect(() => {
      if (showDeleteUser) {
        setShowDeleteUser(false);
      }
    }, [refreshTrigger])


    // Remove tokens from localstorage to logout user and close logout form
    function LogoutForm() {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (showUserDropdown) {
        setShowUserDropdown(false)
      }
      setIsLoggedIn(false);
      setShowLogoutConfirm(false);
    }
    
    return (
        <>  
            <div className="flex flex-row h-15 w-[71rem] items-center justify-between">
                <div className="w-28">
                  {isLoggedIn && (
                    <Link to="./watchlist">
                      <p className='pl-5 cursor-pointer text-neutral-400 hover:text-gray-200'>
                        Watchlists
                      </p>
                    </Link>
                  )}
                </div>
                <div className="flex ">
                  <Link to=".">
                    <h2 className=" font-mono text-4xl text-green-400">STOCKER</h2>
                  </Link>
                </div>
                {/* If user is logged in only show logout button, if not logged in show login and register buttons */}
                {isLoggedIn ? (
                  <div className="flex flex-row gap-5 w-30 text-neutral-400"
                  ref={dropdownRef}>
                    <div className='relative'>
                      <p 
                      className='cursor-pointer hover:text-gray-200' 
                      onClick={() => setShowUserDropdown(!showUserDropdown)}>
                        {currentUser && currentUser.username}
                      </p>
                      {showUserDropdown ? (
                        <div className='flex flex-col gap-2 absolute w-[8rem] bg-black flex p-1 mt-1 pt-2 pb-2  border-1 border-stone-800 rounded-md'
                        >
                          <p 
                          className='cursor-pointer hover:text-gray-200'
                          onClick={() => setShowDeleteUser(true)}
                          >
                            Delete account
                            </p>
                          <p onClick={() => setShowLogoutConfirm(true)} className="cursor-pointer hover:text-gray-200">Logout</p>
                        </div>
                        
                      ) : (
                        null
                      )
                      } 

                    </div>
                    
                  </div> 
                ) : (
                  <div className="flex flex-row gap-3 w-30 text-neutral-400">
                      <p onClick={() => setShowLogin(true)} className="cursor-pointer hover:text-gray-200">Login</p>
                      <p onClick={() => setShowRegister(true)} className="cursor-pointer hover:text-gray-200">Register</p>
                  </div>
                )
              }

            </div>

            {showLogoutConfirm && (
              <LogoutConfirmForm 
                setShowLogoutConfirm={setShowLogoutConfirm} 
                LogoutForm={LogoutForm}
                >
              </LogoutConfirmForm>
            )}

            {showLogin && (
              <LoginForm 
                setIsLoggedIn={setIsLoggedIn} 
                setShowLogin={setShowLogin}
                ResponseForm={ResponseForm}
                showLogin={showLogin}
              />
            )}

            {showRegister && (
              <RegisterForm 
                setShowRegister={setShowRegister}
                setShowLogin={setShowLogin} 
                ResponseForm={ResponseForm}
              />
            )}

            {showDeleteUser && (
              <DeleteUserForm
              setIsLoggedIn={setIsLoggedIn}
              setShowDeleteUser={setShowDeleteUser}
              showDeleteUser={showDeleteUser}
              setRefreshTrigger={setRefreshTrigger}
              />
            )}
        </>
    )
}