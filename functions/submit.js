/**
 * POST /submit
 */
export async function onRequestPost(context) {
  try {
    //

    let input = await context.request.formData();

    // Convert FormData to JSON
    let output = {};
    for (let [key, value] of input) {
      let tmp = output[key];
      if (tmp === undefined) {
        output[key] = value;
      } else {
        output[key] = [].concat(tmp, value);
      }
    }

    // validate honeypot
    if (output["honeypot"] !== "") {
      return new Response(`Error: The honeypot field must be empty.`, {
        status: 400,
      });
    }

    // validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(output["email"])) {
      return new Response(`Error: Email not correct.`, { status: 400 });
    }

    // check spam
    const apiKey = "qFYe6srB3AdnztutDeQPCmhe9w4k3kMlKAfOYs0G";
    const ip = await getIPAddress();

    // check string of all inputs
    let outputString = "";
    for (const [key, value] of Object.entries(output)) {
      outputString += key + ":" + value + " ";
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: outputString,
        ip: ip,
      }),
    };

    
    
    fetch(
      "https://api.oopspam.com/v1/spamdetection",
      requestOptions
    )
      .then((response) => response.json())
      .then((data) => {
        if (parseInt(data.score) > 2) 
          return new Response(`Error: you are spam `);
        else return new Response(`score.`+data.score);
      })
      .catch((error) => {
        return new Response(error);
      });

    
        
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: context.env.FORM_SERVICE_API_KEY,
      },
      body: JSON.stringify(output),
    };

    const result = await fetch("https://contactform.cleaner-web.com/", options);

    if (result.status == 201) {
      return Response.redirect("https://cleaner-web.com/form-success/", 301);
    } else {
      return new Response(
        JSON.stringify({ message: "Message submission failed!", result }),
        {
          headers: { "content-type": "text/json" },
          status: 400,
        }
      );
    }
  } catch (err) {
    return new Response(`Error: ${err}`, { status: 400 });
  }
}

async function getIPAddress() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
}
