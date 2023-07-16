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
      src={"http://127.0.0.1:3000/uploads/" + place.photos[index]}
      alt=""
    />
  );
}
