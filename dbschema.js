let db = {
    users: [
        {
            // basic user info
            userId: 'id',
            email: 'user@gmail.com',
            handle: 'user',
            createdAt: 'date-date-data',
            imageUrl: 'image/dessi',

            // extra user info
            bio: 'hello my name is user, nice to meet you',
            website: 'https://user.com',
            location: 'Petion-Ville, Haiti'
        }
    ],

    notifications: [
        {
          recipient: 'user',
          sender: 'john',
          read: 'true | false',
          screamId: 'kdjsfgdksuufhgkdsufky',
          type: 'like | comment',
          createdAt: '2019-03-15T10:59:52.798Z'
        }
    ],


    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream body',
            createdAt: "2019-11-07T15:57:20.173Z",
            likeCount: 5,
            commentCount: 2
        }
    ],

    comments: [
        {
            userHandle: 'user',
            screamId: 'hiaugdugfigfud',
            body: 'nice one mate!',
            createdAt: 'date'
        }
    ]
};