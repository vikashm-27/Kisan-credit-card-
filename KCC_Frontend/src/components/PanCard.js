import { useForm } from "react-hook-form";
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import 'primeflex/primeflex.css';
 
 
export default function PanCard() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
 
  const onSubmit = (data) => {
    console.log(data);
  };
 
  const cardStyle = {
    backgroundColor: '#fce3fe',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };
 
  return (
    <div style={cardStyle}>
      <Card className="w-full md:w-25rem bg-black" style={{ padding: '3rem' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="PanCard">PAN Card</label>
            <InputText
              id="PanCard"
              {...register("PanCard", {
                required: true,
                pattern: /^([A-Z]){5}([0-9]){4}([A-Z]){1}?$/
              })}
              style={{ width: '100%' }}
            />
            {errors?.PanCard?.type === "required" && <small className="p-error">This field is required</small>}
            {errors?.PanCard?.type === "pattern" && (
              <small className="p-error">Enter a valid PAN Card number (e.g., ABCDE1234F)</small>
            )}
          </div>
          <Button type="submit" label="Submit" className="button-text mt-1" style={{ fontSize: '15px' }} />
        </form>
      </Card>
    </div>
  );
}