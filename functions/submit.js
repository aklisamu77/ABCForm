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
       
      return new Response(`Error: The honeypot field must be empty.`, { status: 400 });
    }

    // validate email 
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(output["email"])) {
      return new Response(`Error: Email not correct.`, { status: 400 });
    }
    

    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': context.env.FORM_SERVICE_API_KEY
        },
        body: JSON.stringify(output),
      };

    const result = await fetch('https://contactform.cleaner-web.com/', options)

    if (result.status == 201) {
        return Response.redirect('https://cleaner-web.com/form-success/', 301);
      } else {
      return new Response(JSON.stringify({ message: 'Message submission failed!', result }), {
        headers: { 'content-type': 'text/json' },
        status: 400,
      });
    };
  } catch (err) {
    return new Response(`Error: ${err}`, { status: 400 });
  }
}