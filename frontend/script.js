const API_BASE = "http://127.0.0.1:8080";

let reviewResult = null;

let currentFilename = "Untitled.java";



/* =========================================================
   ELEMENTS
========================================================= */

const pasteModeButton =
    document.getElementById("pasteModeButton");

const uploadModeButton =
    document.getElementById("uploadModeButton");

const uploadArea =
    document.getElementById("uploadArea");

const fileInput =
    document.getElementById("fileInput");

const selectedFile =
    document.getElementById("selectedFile");

const filenameInput =
    document.getElementById("filenameInput");

const codeInput =
    document.getElementById("codeInput");

const reviewButton =
    document.getElementById("reviewButton");

const reviewTab =
    document.getElementById("reviewTab");

const fixTab =
    document.getElementById("fixTab");

const reviewContent =
    document.getElementById("reviewContent");

const fixContent =
    document.getElementById("fixContent");

const reviewResultDiv =
    document.getElementById("reviewResult");

const fixResultDiv =
    document.getElementById("fixResult");



/* =========================================================
   INPUT MODE
========================================================= */

pasteModeButton.addEventListener(
    "click",
    () => {

        pasteModeButton.classList.add("active");

        uploadModeButton.classList.remove("active");

        uploadArea.classList.remove("active");

        /*
         * Enable filename editing in paste mode.
         */

        filenameInput.disabled = false;

        filenameInput.focus();

    }
);



uploadModeButton.addEventListener(
    "click",
    () => {

        uploadModeButton.classList.add("active");

        pasteModeButton.classList.remove("active");

        uploadArea.classList.add("active");

        /*
         * Filename will be controlled by
         * the uploaded file.
         */

        filenameInput.disabled = true;

    }
);



/* =========================================================
   FILENAME INPUT
========================================================= */

filenameInput.addEventListener(
    "input",
    () => {

        currentFilename =
            filenameInput.value.trim();

    }
);



/* =========================================================
   FILE UPLOAD
========================================================= */

uploadArea.addEventListener(
    "click",
    () => {

        fileInput.click();

    }
);



fileInput.addEventListener(
    "change",
    (event) => {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        /*
         * Get filename from uploaded file.
         */

        currentFilename =
            file.name;


        /*
         * Display filename.
         */

        filenameInput.value =
            file.name;


        selectedFile.textContent =
            file.name;


        /*
         * Read source code.
         */

        const reader =
            new FileReader();


        reader.onload =
            (e) => {

                codeInput.value =
                    e.target.result;

            };


        reader.readAsText(file);

    }
);



/* =========================================================
   TAB SWITCHING
========================================================= */

reviewTab.addEventListener(
    "click",
    () => {

        switchTab("review");

    }
);



fixTab.addEventListener(
    "click",
    () => {

        if (!fixTab.disabled) {

            switchTab("fix");

        }

    }
);



function switchTab(tab) {


    /* ---------------- REVIEW TAB ---------------- */

    if (tab === "review") {

        reviewTab.classList.add("active");

        fixTab.classList.remove("active");


        reviewContent.classList.add("active");

        fixContent.classList.remove("active");


        return;

    }



    /* ---------------- FIX TAB ---------------- */

    if (tab === "fix") {


        if (fixTab.disabled) {

            return;

        }


        fixTab.classList.add("active");

        reviewTab.classList.remove("active");


        fixContent.classList.add("active");

        reviewContent.classList.remove("active");

    }

}



/* =========================================================
   REVIEW
========================================================= */

reviewButton.addEventListener(
    "click",
    reviewCode
);



async function reviewCode() {


    const code =
        codeInput.value.trim();


    /*
     * Validate code.
     */

    if (!code) {

        alert(
            "Please paste or upload source code."
        );

        return;

    }



    /*
     * Get filename.
     *
     * In paste mode this comes from
     * the editable filename field.
     *
     * In upload mode it was populated
     * automatically from the file.
     */

    currentFilename =
        filenameInput.value.trim();


    /*
     * Default filename if empty.
     */

    if (!currentFilename) {

        currentFilename =
            "Untitled.java";

        filenameInput.value =
            currentFilename;

    }



    /*
     * Disable button while reviewing.
     */

    reviewButton.disabled =
        true;

    reviewButton.textContent =
        "Reviewing...";



    /*
     * Switch to Review tab.
     */

    switchTab("review");



    /*
     * Loading state.
     */

    reviewResultDiv.innerHTML = `

        <div class="loading">

            Analyzing your code...

        </div>

    `;



    try {


        /* -----------------------------------------
           SEND REQUEST TO SPRING BOOT
        ----------------------------------------- */

        const response =
            await fetch(
                `${API_BASE}/api/review`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        filename:
                            currentFilename,

                        code:
                            code

                    })

                }
            );



        /*
         * Check HTTP status.
         */

        if (!response.ok) {

            throw new Error(
                `Review failed with status ${response.status}`
            );

        }



        /*
         * Read response.
         */

        reviewResult =
            await response.json();



        /*
         * Display review.
         */

        displayReview();



        /*
         * Enable Fix tab.
         */

        fixTab.disabled =
            false;


    } catch (error) {


        reviewResultDiv.innerHTML = `

            <div class="error">

                <strong>
                    Review failed
                </strong>

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    } finally {


        /*
         * Re-enable button.
         */

        reviewButton.disabled =
            false;

        reviewButton.textContent =
            "Review Code";

    }

}



/* =========================================================
   DISPLAY REVIEW
========================================================= */

function displayReview() {


    const issues =
        Array.isArray(reviewResult.issues)
            ? reviewResult.issues
            : [];



    /*
     * NO ISSUES
     */

    if (issues.length === 0) {


        reviewResultDiv.innerHTML = `

            <div class="summary-box">

                <div class="summary-title">

                    No Issues Found

                </div>

                ${escapeHtml(
                    reviewResult.summary ||
                    "No issues found."
                )}

            </div>

        `;


        return;

    }



    /*
     * BUILD ISSUE CARDS
     */

    let html = "";



    issues.forEach(
        (issue) => {


            const severity =
                String(
                    issue.severity ||
                    "LOW"
                ).toUpperCase();



            html += `

                <div class="issue-card">

                    <div class="issue-top">

                        <div class="issue-type">

                            ${escapeHtml(
                                issue.type ||
                                "Issue"
                            )}

                        </div>


                        <div
                            class="severity ${severity}">

                            ${escapeHtml(
                                severity
                            )}

                        </div>

                    </div>


                    <div class="issue-message">

                        ${escapeHtml(
                            issue.message ||
                            ""
                        )}

                    </div>


                    <div class="issue-meta">

                        Line:
                        ${escapeHtml(
                            String(
                                issue.line ?? 0
                            )
                        )}

                    </div>


                    <div class="suggestion">

                        <strong>
                            Suggestion:
                        </strong>

                        ${escapeHtml(
                            issue.suggestion ||
                            ""
                        )}

                    </div>

                </div>

            `;

        }
    );



    /*
     * SUMMARY + FIX BUTTON
     */

    html += `

        <div class="summary-box">

            <div class="summary-title">

                Summary

            </div>

            ${escapeHtml(
                reviewResult.summary ||
                ""
            )}

        </div>


        <div class="review-actions">

            <button
                id="generateFixButton"
                class="fix-button"
                type="button">

                Generate Fix

            </button>

        </div>

    `;



    /*
     * Insert HTML.
     */

    reviewResultDiv.innerHTML =
        html;



    /*
     * Connect Generate Fix button.
     */

    document
        .getElementById(
            "generateFixButton"
        )
        .addEventListener(
            "click",
            fixCode
        );

}



/* =========================================================
   FIX
========================================================= */

async function fixCode() {


    if (!reviewResult) {

        return;

    }



    const code =
        codeInput.value;



    /*
     * Make sure filename is current.
     */

    currentFilename =
        filenameInput.value.trim();



    if (!currentFilename) {

        currentFilename =
            "Untitled.java";

    }



    /*
     * Enable Fix tab.
     */

    fixTab.disabled =
        false;



    /*
     * Switch to Fix tab.
     */

    switchTab("fix");



    /*
     * Loading state.
     */

    fixResultDiv.innerHTML = `

        <div class="loading">

            Generating fix...

        </div>

    `;



    try {


        /* -----------------------------------------
           SEND FIX REQUEST
        ----------------------------------------- */

        const response =
            await fetch(
                `${API_BASE}/api/fix`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        filename:
                            currentFilename,

                        code:
                            code,

                        issues:
                            reviewResult.issues ||
                            []

                    })

                }
            );



        /*
         * Check response.
         */

        if (!response.ok) {

            throw new Error(
                `Fix failed with status ${response.status}`
            );

        }



        /*
         * Read response.
         */

        const result =
            await response.json();



        /*
         * Display fixed code.
         */

        displayFix(result);


    } catch (error) {


        fixResultDiv.innerHTML = `

            <div class="error">

                <strong>
                    Fix generation failed
                </strong>

                <br><br>

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}



/* =========================================================
   DISPLAY FIX
========================================================= */

function displayFix(result) {


    fixResultDiv.innerHTML = `

        <div class="fix-section">

            <div class="section-title">

                Fixed Code

            </div>


            <pre
                id="fixedCode"
                class="code-output">${escapeHtml(
                    result.fixedCode ||
                    ""
                )}</pre>


            <div class="fix-actions">

                <button
                    id="copyFixedCodeButton"
                    class="secondary-button"
                    type="button">

                    Copy Fixed Code

                </button>

            </div>

        </div>


        <div class="fix-section">

            <div class="section-title">

                Change Summary

            </div>


            <div class="change-summary">

                ${escapeHtml(
                    result.summary ||
                    "Changes applied."
                )}

            </div>

        </div>

    `;



    /*
     * Connect Copy button.
     */

    document
        .getElementById(
            "copyFixedCodeButton"
        )
        .addEventListener(
            "click",
            copyFixedCode
        );

}



/* =========================================================
   COPY FIXED CODE
========================================================= */

async function copyFixedCode() {


    const fixedCode =
        document.getElementById(
            "fixedCode"
        );



    if (!fixedCode) {

        return;

    }



    try {


        await navigator.clipboard.writeText(
            fixedCode.textContent
        );



        const button =
            document.getElementById(
                "copyFixedCodeButton"
            );



        button.textContent =
            "Copied!";



        setTimeout(
            () => {

                button.textContent =
                    "Copy Fixed Code";

            },
            1500
        );


    } catch (error) {


        alert(
            "Could not copy the fixed code."
        );

    }

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}