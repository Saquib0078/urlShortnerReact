const shortid = require("shortid");
const UrlModel = require('../Models/UrlModel')
const { isValidUrl, isValid } = require('../Utils/validation')
const redis = require("redis");
const { promisify } = require("util");



const redisClient = redis.createClient(
  16441,
  "redis-16441.c15.us-east-1-2.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("u2SCdcxDHNNGy3Fl11G9RoHJaP6kcOrS", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});

const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
const SETEX_ASYNC = promisify(redisClient.SETEX).bind(redisClient);



let Shorturl = async (req, res) => {
  try {
    let data = req.body

    if (!isValid(data)) return res.status(400).send({ status: false, msg: 'body shoulnot be empty' })

    if (!data.longUrl) return res.status(400).send({ status: false, msg: 'longUrl is required' })
    if (!isValidUrl(data.longUrl)) return res.status(400).send({ status: false, msg: 'Url is not valid' })

    let checkUrl = await UrlModel.findOne({ longUrl: data.longUrl }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 });
    let getUrl = await GET_ASYNC(`${data.longUrl}`);
    let url = JSON.parse(getUrl);
    if(url){
      return res.status(200).send({ status: true, message:"Success", data: url })
    }
    if(checkUrl) {

      //if already exist then setting the document in the cache with expire time 
      await SETEX_ASYNC(`${data.longUrl}`, 84600, JSON.stringify(checkUrl))
      return res.status(200).send({status:true, message:"Success", data: checkUrl})
    }


    // if (checkUrl) {
    //   return res.status(200).send({ status: true, message: "Success", data: checkUrl })
    // }
    urlCode = shortid.generate().toLowerCase()

    let baseUrl = "http://localhost:3000/"

    let shortUrl = baseUrl + urlCode

    let saveData = {
      urlCode: urlCode,
      longUrl: data.longUrl,
      shortUrl: shortUrl

    }
  
    await UrlModel.create(saveData)
    res.status(201).send({ status: true, message: "URL create successfully", data: saveData })

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }
}


let Geturl = async (req, res) => {
  try {
    const code = req.params.urlCode

    //find urlCode
    const url = await UrlModel.findOne({ urlCode: code });
    

    if (!url) {
      return res.status(404).send({ message: "No url found" });
    }
    // return res.send(url)

    console.log("Long url found for short url. Redirecting...");
    return res.status(302).redirect(url.longUrl);

  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })
  }

}


module.exports.Shorturl = Shorturl;
module.exports.Geturl = Geturl;


