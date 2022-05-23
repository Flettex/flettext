// async fn add_todo(pool: &PgPool, description: String) -> sqlx::Result<i64> {
//     let rec = sqlx::query!(
//         r#"
// INSERT INTO todos ( description )
// VALUES ( $1 )
// RETURNING id
//         "#,
//         description
//     )
//     .fetch_one(pool)
//     .await?;

//     Ok(rec.id)
// }

// async fn list_todos(pool: &PgPool) -> sqlx::Result<()> {
//     let recs = sqlx::query!(
//         r#"
// SELECT id, description, done
// FROM todos
// ORDER BY id
//         "#
//     )
//     .fetch_all(pool)
//     .await?;

//     for rec in recs {
//         println!(
//             "- [{}] {}: {}",
//             if rec.done { "x" } else { " " },
//             rec.id,
//             &rec.description,
//         );
//     }

//     Ok(())
// }