const express = require('express')

const app = express()

const port = 3000


app.get('/', (req, res) => {
    res.status(200).json({ message: "This is running", app: "Natours App", author: "Kshitij Bajpai" })
})


app.listen(port, () => {
    console.log(`Started listening on ${port}...`)
})