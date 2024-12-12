db.locations.insertOne({
    name: 'Starcups',
    address: '125 High Street, Reading, RG6 1PS',
    rating: 3,
    facilities: ['Hot drinks', 'Food', 'Premium wifi'],
    coords: {lng: -0.9690884, lat: 51.455041},
    openingTimes: [
        {
        days: 'Monday - Friday',
        opening: '7:00am',
        closing: '7:00pm',
        closed: false
        },
        {
        days: 'Saturday',
        opening: '8:00am',
        closing: '5:00pm',
        closed: false
        },
        {
        days: 'Sunday',
        closed: true
        }
    ]
})

db.locations.updateOne({
    name: 'Starcups'
}, {
    $push: {
        reviews: {
            author: 'Simon Holmes',
            _id: ObjectId(),
            rating: 5,
            timestamp: new Date("Mar 12, 2017"),
            reviewText: "What a great place."
        }
    }
})