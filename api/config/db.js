import mongoose from "mongoose";




// create a mongoDB cannection

const mongoDBConnect = async () => {
    
    try {
        
        const cannection = await mongoose.connect(process.env.MONGO_STRING);
        console.log(`Mongo DB Connected successfully`.bgBlue.black);

    } catch (error) {
        
        console.log(error);

    }



}

// export mongo cannection
export default mongoDBConnect;
