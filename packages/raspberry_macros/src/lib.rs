use proc_macro::TokenStream;
use syn::{
    parse_macro_input,
    ItemStruct,
    LitInt,
};

#[proc_macro_attribute]
pub fn ratelimit(limit: TokenStream, item: TokenStream) -> TokenStream {
    let limit2 = parse_macro_input!(limit as LitInt);
    let item2 = item.to_owned();
    let name = parse_macro_input!(item2 as ItemStruct);
    let nom = name.ident;
    let impl_ = quote::quote! {
        impl #nom  {
            pub fn limit() -> u32 {
                #limit2
            }
        }
    };
    let mut item: proc_macro2::TokenStream = item.into();
    item.extend(impl_);
    item.into()
}
