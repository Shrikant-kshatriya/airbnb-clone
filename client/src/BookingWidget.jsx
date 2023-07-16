import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numberOfGuest, setNumberOfGuest] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [redirect, setRedirect] = useState('');
  const {user} = useContext(UserContext);

  useEffect(() => {
    if(user){
      setName(user.name);
    }
  },[user])

  let numberOfNights = 0;
  if ((checkIn, checkOut)) {
    numberOfNights = differenceInCalendarDays(
      new Date(checkOut),
      new Date(checkIn)
    );
  }

  async function bookPlace(){
    if(user){

      const bookingData = {
        checkIn,
        checkOut,
        numberOfGuest,
        name,
        phone,
        place:place._id,
        price: numberOfNights * place.price
      }
      const {data} = await axios.post('/bookings', bookingData);
      const bookingId = data._id;
      setRedirect('/account/bookings/'+bookingId);
    }else {
      setRedirect('/login');
    }
  }

  if(redirect){
    return <Navigate to={redirect} />
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center flex justify-between px-3">
        <div>Price:</div>
        <div>₹{place.price}/night</div>
      </div>
      <div className="border mt-4 rounded-2xl ">
        <div className="flex">
          <div className="p-3">
            <label>Check in:</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
          </div>
          <div className="p-3 border-l">
            <label>Check Out:</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
          </div>
        </div>
        <div className="p-3 border-t">
          <label>Number of Guests:</label>
          <input
            type="number"
            max={place.maxGuest}
            value={numberOfGuest}
            onChange={(e) => setNumberOfGuest(e.currentTarget.value)}
          />
        </div>
        {numberOfNights > 0 && (
          <div className="p-3 border-t">
          <label>Your Full Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <label>Your Phone no:</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.currentTarget.value)}
          />
        </div>
        )}
      </div>
      <button onClick={bookPlace} className="mt-4 primary">
        Book this Place
        {numberOfNights? (
          <>
            <span> ₹{numberOfNights * place.price}</span>
          </>
        ):''}
      </button>
    </div>
  );
}
