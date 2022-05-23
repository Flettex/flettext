use std::process::Command;

fn main() {
    Command::new("bash")
    .arg("html.sh")
    .spawn()
    .expect("bash command failed to start");
}