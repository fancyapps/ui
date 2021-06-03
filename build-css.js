const fs = require("fs");
const sass = require("sass");

const files = ["Panzoom", "Panzoom.Controls", "Carousel", "Fancybox"];

for (const file_name of files) {
  let input_file;
  let output_file;

  const words = file_name.split(".");
  const component = words[0];
  const plugin = words[1] || false;

  if (plugin) {
    input_file = `./src/${component}/plugins/${plugin}/${plugin}.scss`;
    output_file = `./dist/${component.toLowerCase()}.${plugin.toLowerCase()}.css`;
  } else {
    input_file = `./src/${component}/${component}.scss`;
    output_file = `./dist/${component.toLowerCase()}.css`;
  }

  console.log(`${input_file} → ${output_file}...`);

  sass.render(
    {
      file: input_file,
      outputStyle: "compressed",
    },
    (error, result) => {
      if (!error) {
        fs.writeFile(output_file, result.css, (err) => {
          if (!err) {
            console.log(`Created ${output_file}`);
          } else {
            console.error(err);
          }
        });
      } else {
        console.error(error);
      }
    }
  );
}
