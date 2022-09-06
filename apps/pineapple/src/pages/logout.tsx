
export default function Logout() {
    return (
        <button onClick={() => {
            fetch("/api/logout", {
                method: "DELETE",
            }).then((res) => alert(res.status));
        }}>Logout</button>
    )
}