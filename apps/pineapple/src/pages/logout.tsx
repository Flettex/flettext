
export default function Logout() {
    return (
        <button onClick={() => {
            fetch("/api/logout", {
                method: "DELETE",
                credentials: 'include'
            }).then((res) => alert(res.status));
        }}>Logout</button>
    )
}