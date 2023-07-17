export default function PlaceImg({place,index=0,className=null}) {
  if (!place.photos?.length) {
    return "";
  }
  if(!className){
    className="object-cover h-full"
  }
  return (
    <img
      className={className}
      src={import.meta.env.VITE_API_URL+"/uploads/" + place.photos[index]}
      alt=""
    />
  );
}
