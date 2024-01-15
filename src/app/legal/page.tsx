const LegalContent = () => {
    return (
        <section className="container mx-auto px-4 py-8">
            <h1 className=" font-semibold">
                Legal Stuff
            </h1>
            Please be aware of the following before using webnotes.
            <ul className="list-disc list-inside">
                <li>
                    There are no trackers, no ads and any other stuff that might be considered "bad". The notes you write are
                    stored in your browser's local storage and are not sent to any server.
                </li>
                <li>
                    If you proceed to share a note, it will be uploaded to my database (Xata) and you will be given a link to
                    share. Anyone with the link can view the note.
                </li>
                <li>
                    The notes will not be deleted unless I sunset the project or you ask me to delete them (
                    <a href="mailto:ishaanbedi13@gmail.com" target="_blank" className="text-blue-500">
                        email me for the same
                    </a>
                    ).
                </li>
                <li>
                    I do not take any responsibility for the content of the notes you write and decide to share. You are
                    responsible for your own actions.
                </li>
                <li>This project is open sourced on GitHub.</li>
                <li>
                    For any kind of queries, feedback, bugs, issues please{' '}
                    <a href="mailto:ishaanbedi13@gmail.com" target="_blank" className="text-blue-500">
                        email me
                    </a>
                    .
                </li>
                <li>
                    On my part, all your notes are safe and secure. If you believe otherwise, please do not use this
                    service.
                </li>
                <li>
                    Based on your region/country, you may be subject to additional laws and regulations. Please check with
                    your local authorities and use the service accordingly.
                </li>
                <li>
                    You can write any kind of notes you want that stays within your browser. However, if you decide to share a note, please be mindful of the content you write.
                </li>
                <li>
                    Stuff you are welcomed to write and share: notes, poems, stories, articles, essays, homework, assignments, etc.
                </li>
                <li>
                    Stuff you are not allowed to share: hate speech, racism, transphobia, xenophobia, etc.
                </li>
                <li>
                    This service is NOT meant for children under the age of 13.
                </li>
                <li>
                    Please be mindful if a child is using this service since this is an open platform and anyone can share anything.
                </li>
            </ul>

            If you do not agree with any of the above, please do not use this service. I am not responsible for any kind of damage that may occur if you go against the above.

            <p>
                Last updated: 15/01/2024
            </p>
        </section>
    );
};

export default LegalContent;
