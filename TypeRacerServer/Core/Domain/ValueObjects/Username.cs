namespace TypeRacerServer.Core.Domain.ValueObjects;

public record Username
{
    public string Value { get; }

    public Username(string value)
    {
        if(string.IsNullOrWhiteSpace(value)) throw new  ArgumentException("Username cannot be null or whitespace.");
        Value = value;
    }

    public static implicit operator Username(string value) => new (value);
    public static implicit operator string(Username value) => value.Value;
}