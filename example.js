//json-like object:
var testpage={
    content: 'welcome to aui',
    type: 'page',
    backgroundimage: '',
    subelements:[
        {
            content: 'this is an example presentation',
            pretext: 'title',
        },//title,
        {
            content: 'as such it has not a lot of content.',
            pretext: 'paragraph',
        }, //text
        {
            content: 'on the left',
            type: 'container',
            id: 'left',
            pretext: '',
            subelements:[
                {
                    type: 'image',
                    content: 'a picture of something',
                    pretext: 'image'
                },//image,
                {
                    content:'what a beautiful picture, isnt it?'
                }//subtext,
            ]
        },//left,
        {
            content: 'on the right',
            type: 'container',
            id: 'right',
            pretext: '',
            subelements:[
                {
                    content:'how it works',
                    pretext: 'title',
                },//subtitle,
                {
                    content:`it works by building up a simple tree. this tree can then be navigated by the user with its arrow keys.
                    as such there is nothing to prevent us to build up a good user experience for keyboard-related users.
                    such users have the focus always on one element and only one element at a time. this is reflected in the tree-structure.
                    but therefore it is important to build up a good flow, which users can then follow to get as fast as possible
                    to the content they want to get.
                    we should never forget that the fastest ways are not always the most intuitive.
                    a good aproach should always bear in mind that the users dont know all the possible shortcuts there are nor is
                    he or she willing to learn all of them just to use your side.
                    as such - the more simple and intuitive your tree-structure is the better.
                    avoid big elements such as this, as they are not nearly as easy to navigate and therefore be consumed then a
                    good tree-structure, but also avoid too complicated trees. not every word has to be a subelement, you know.
                    `,
                    pretext: 'paragraph',
                },//paragraph,
            ]
        },//right
    ]
}
audio_user_interface.loadMain(testpage);
